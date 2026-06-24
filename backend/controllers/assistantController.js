const { queryAssistant } = require('../services/assistantService');

async function postQuery(req, res, next) {
  try {
    const { query, coursId, devoirId } = req.body;
    if (!query || typeof query !== 'string') return res.status(400).json({ message: 'Champ query requis' });

    const tenantId = req.tenantId || req.body.tenantId || null;

    const result = await queryAssistant({ tenantId, query, coursId, devoirId });

    return res.json({ ok: true, answer: result.answer, sources: result.sources || [], notEnoughContext: !!result.notEnoughContext });
  } catch (err) {
    next(err);
  }
}

module.exports = { postQuery };
