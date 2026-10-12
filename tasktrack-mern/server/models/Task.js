import mongoose from "mongoose";

// A schema defines which fields each task document can contain.
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "A task title is required"],
      trim: true,
      minlength: 1,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    completed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// A model gives us methods for reading/writing documents in MongoDB.
export default mongoose.model("Task", taskSchema);
