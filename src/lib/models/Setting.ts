import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  key: string; // e.g. 'site_config', 'hero_config', 'seo_config'
  value: Record<string, unknown>;
}

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;
