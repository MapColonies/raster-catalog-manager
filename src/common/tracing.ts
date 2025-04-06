import { Tracing } from '@map-colonies/telemetry';
import { IGNORED_INCOMING_TRACE_ROUTES, IGNORED_OUTGOING_TRACE_ROUTES } from './constants';

/* eslint-disable @typescript-eslint/naming-convention */
const tracing = new Tracing({
  autoInstrumentationsConfigMap: {
    '@opentelemetry/instrumentation-http': {
      requireParentforOutgoingSpans: true, //  Ensures HTTP calls must have a parent span to be traced
      ignoreIncomingRequestHook: (request): boolean =>
        IGNORED_INCOMING_TRACE_ROUTES.some((route) => request.url !== undefined && route.test(request.url)),
      ignoreOutgoingRequestHook: (request): boolean =>
        IGNORED_OUTGOING_TRACE_ROUTES.some((route) => typeof request.path === 'string' && route.test(request.path)),
    },
    '@opentelemetry/instrumentation-fs': {
      requireParentSpan: true, // Ensures FS operations must have a parent span to be traced
    },
    '@opentelemetry/instrumentation-express': {
      enabled: false, // Express instrumentation is disabled since this is a worker service without HTTP routes
    },
  },
});
// This configuration ensures we only trace operations that are part of actual worker tasks, reducing noise from standalone operations.
/* eslint-enable @typescript-eslint/naming-convention */

tracing.start();

export { tracing };
