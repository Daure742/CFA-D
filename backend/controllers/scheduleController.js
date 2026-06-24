const Schedule = require('../models/Schedule');
const Cohorte = require('../models/Cohorte');

// Create or publish a schedule (admins)
exports.createSchedule = async (req, res, next) => {
  try {
    const { cohorteId, weekStart, slots, published, versionNote } = req.body;
    // Basic validation
    const cohorte = await Cohorte.findById(cohorteId);
    if (!cohorte) return res.status(404).json({ message: 'Cohorte introuvable' });

    const schedule = new Schedule({
      tenantId: req.tenant.id,
      cohorte: cohorteId,
      weekStart: new Date(weekStart),
      slots: slots || [],
      published: Boolean(published),
      publishedBy: published ? req.user.id : undefined,
      versionNote
    });

    await schedule.save();

    // If published, mark older schedules as unpublished (keeping history)
    if (schedule.published) {
      await Schedule.updateMany(
        {
          tenantId: req.tenant.id,
          cohorte: cohorteId,
          _id: { $ne: schedule._id }
        },
        { $set: { published: false } }
      );
    }

    res.status(201).json(schedule);
  } catch (err) {
    next(err);
  }
};

// Get latest published schedule for a cohorte (or latest created)
exports.getLatest = async (req, res, next) => {
  try {
    const { cohorteId } = req.params;
    const schedule = await Schedule.findOne({
      tenantId: req.tenant.id,
      cohorte: cohorteId
    })
      .sort({ published: -1, weekStart: -1, createdAt: -1 })
      .lean();

    if (!schedule) return res.status(404).json({ message: 'Aucun planning trouvé' });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
};

// Get schedule by weekStart
exports.getByWeek = async (req, res, next) => {
  try {
    const { cohorteId } = req.params;
    const { weekStart } = req.query;
    const q = { tenantId: req.tenant.id, cohorte: cohorteId };
    if (weekStart) q.weekStart = new Date(weekStart);

    const schedule = await Schedule.findOne(q).sort({ createdAt: -1 }).lean();
    if (!schedule) return res.status(404).json({ message: 'Aucun planning pour cette semaine' });
    res.json(schedule);
  } catch (err) {
    next(err);
  }
};
