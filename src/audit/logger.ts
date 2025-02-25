import pino from 'pino'

const logger = pino({
    level: 'info',
    formatters: {
        level: (label) => ({ level: label }),
        bindings: (it) => ({})
    },
    timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
})

export default logger