'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const tripSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: String
    // required: true
  },
  budget: {
    type: Number
    // required: true
  },
  activities: [{
    type: ObjectId,
    ref: 'Activity'
  }]
});

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
