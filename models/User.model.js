const { Schema, model } = require('mongoose');

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name is required.']
    },
    lastName: {
      type: String,
      required: [true, 'Last Name is required.']
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required.']
    },
    trips: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Trip'
      }
    ]
  },
  {
    timestamps: true
  }
);

const User = model('User', userSchema);

module.exports = User;
