import mongoose from 'mongoose';

const facturacionSchema = new mongoose.Schema({
  cbu: { type: String, default: '' },
  medioDePago: { type: String, default: '' },
  alias: { type: String, default: '' }
});

export default facturacionSchema;
