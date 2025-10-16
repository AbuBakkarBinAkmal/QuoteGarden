module.exports = { Container: { get: function (ServiceClass) { try { return new ServiceClass(); } catch (e) { return {}; } }, }, };
