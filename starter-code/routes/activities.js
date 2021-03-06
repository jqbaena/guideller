const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');
const authMiddleware = require('../middlewares/authMiddleware'); // Middleware
// const formMiddleware = require('../middlewares/formMiddleware');

/* GET activities page. */
router.get('/', (req, res, next) => {
  // R in CRUD
  Activity.find()
    .then((result) => {
      res.render('activities/list-activities', { activities: result });
    })
    .catch(next);
});

// Render the create activity form
router.get('/create', authMiddleware.requireUser, (req, res, next) => {
  res.render('activities/create-activity', { title: 'Activities' });
});

// Receive the acitivity post
router.post('/', authMiddleware.requireUser, (req, res, next) => {
  // to see the information from the post, we need the body of the request
  const { name, location } = req.body;
  const { _id } = req.session.currentUser;
  const newActivity = new Activity({ name, location });
  const updateUserPromise = User.findByIdAndUpdate(_id, { $push: { activities: newActivity._id } });
  const saveActivityPromise = newActivity.save();

  Promise.all([updateUserPromise, saveActivityPromise])
    .then(() => {
      res.redirect('/activities');
    })
    .catch(next);
});

router.get('/:activityId/edit', authMiddleware.requireUser, authMiddleware.checkUser, (req, res, next) => {
  const activityId = req.params.activityId;
  Activity.findById(activityId)
    .then((activity) => {
      res.render('activities/edit-activity', { activity });
    })
    .catch(next);
});

// U in CRUD
router.post('/:activityId/edit', authMiddleware.requireUser, authMiddleware.checkUser, (req, res, next) => {
  const activityId = req.params.activityId;
  const updatedActivityInformation = req.body;
  Activity.findByIdAndUpdate(activityId, { $set: updatedActivityInformation })
    .then(() => {
      res.redirect('/activities/my');
    })
    .catch(next);
});

// D in CRUD
router.post('/:activityId/delete', authMiddleware.requireUser, authMiddleware.checkUser, (req, res, next) => {
  const activityId = req.params.activityId;
  Activity.deleteOne({ _id: activityId })
    .then(() => {
      const { _id } = req.session.currentUser;
      User.findById(_id)
        .then((user) => {
          const userActivities = user.activities;
          if (userActivities.indexOf(activityId) < 0) {
            return res.redirect('/');
          }
        })
        .catch(next);
      res.redirect('/activities/my');
    })
    .catch(next);
});

router.get('/my', authMiddleware.requireUser, (req, res, next) => {
  const { _id } = req.session.currentUser;
  User.findById(_id)
    .populate('activities')
    .then((user) => {
      res.render('activities/my-activities', { user });
    })
    .catch(next);
});

module.exports = router;
