import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { uniqueSlug } from '../utils/slug.js';

/**
 * Small data fixes that run once at start-up. They only touch documents that still need them,
 * so running them again does nothing.
 */
export async function runMigrations() {
  // Products created before readable URLs existed get a slug from their name
  const missing = await Product.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] })
    .select('name')
    .lean();
  for (const p of missing) {
    await Product.updateOne({ _id: p._id }, { slug: await uniqueSlug(Product, p.name, p._id) });
  }
  if (missing.length) console.log(`[db] Added readable URLs to ${missing.length} product(s)`);

  // Reviews written before "Verified purchase" existed were always tied to a completed order
  const verified = await Review.updateMany({ verified: { $exists: false }, order: { $exists: true, $ne: null } }, { $set: { verified: true } });
  if (verified.modifiedCount) console.log(`[db] Marked ${verified.modifiedCount} older review(s) as verified purchases`);
}

// Walks every path of a Mongoose schema, including sub-documents and arrays of sub-documents.
function walkPaths(schema, prefix, visit) {
  schema.eachPath((path, type) => {
    if (type.schema) walkPaths(type.schema, `${prefix}${path}.`, visit);
    else visit(`${prefix}${path}`, type);
  });
}

// The JSON-schema node of a dotted path ("statusHistory.status") inside a collection validator.
function validatorNode(jsonSchema, path) {
  let node = jsonSchema;
  for (const part of path.split('.')) {
    node = node?.properties?.[part] ?? node?.items?.properties?.[part];
    if (!node) return null;
  }
  return node;
}

/**
 * Databases prepared with an older copy of database/marketlink-schema.mongodb.js have validators
 * that do not know the values added later (e.g. the notification type "stock"), so MongoDB would
 * answer "Document failed validation". At start-up every allowed-values list (enum) in the
 * validators is extended with the values the current models use.
 */
export async function syncValidators() {
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const updated = [];
  for (const info of collections) {
    const jsonSchema = info.options?.validator?.$jsonSchema;
    if (!jsonSchema) continue;
    const model = Object.values(mongoose.models).find((m) => m.collection.collectionName === info.name);
    if (!model) continue;
    let dirty = false;
    // Fields the current model no longer requires (e.g. reviews without an order are allowed now)
    if (Array.isArray(jsonSchema.required)) {
      const keep = jsonSchema.required.filter((field) => !model.schema.path(field) || model.schema.path(field).isRequired);
      if (keep.length !== jsonSchema.required.length) {
        jsonSchema.required = keep;
        dirty = true;
      }
    }
    walkPaths(model.schema, '', (path, type) => {
      const values = type.enumValues?.length ? type.enumValues : type.caster?.enumValues;
      if (!values?.length) return;
      const node = validatorNode(jsonSchema, path);
      const target = node?.enum ? node : node?.items?.enum ? node.items : null;
      if (!target) return;
      const missing = values.filter((v) => !target.enum.includes(v));
      if (missing.length) {
        target.enum = [...target.enum, ...missing];
        dirty = true;
      }
    });
    if (dirty) {
      await db.command({ collMod: info.name, validator: { $jsonSchema: jsonSchema }, validationLevel: info.options.validationLevel || 'moderate' });
      updated.push(info.name);
    }
  }
  if (updated.length) console.log(`[db] Updated the database rules (validators) of: ${updated.join(', ')}`);
  return updated;
}
