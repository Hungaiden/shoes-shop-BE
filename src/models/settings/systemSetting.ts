// models/SystemSetting.js
import mongoose from 'mongoose'

const systemSettingSchema = new mongoose.Schema({
  websiteName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true,
    default: 'VND'
  },
  timeZone: {
    type: String,
    required: true,
    default: 'Vietnam (GMT+7)'
  },
  logoUrl: {
    type: String // link ảnh logo
  }
}, {
  timestamps: true
});

export const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema, 'systemSettings')
