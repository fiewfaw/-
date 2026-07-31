const assert = require('node:assert');
const {
  requestCurrentLocation,
} = require('../public/js/current-location-lead.js');

function successProvider(coords, onOptions) {
  return {
    getCurrentPosition(success, _error, options) {
      onOptions?.(options);
      success({ coords });
    },
  };
}

function errorProvider(code) {
  return {
    getCurrentPosition(_success, error) {
      error({ code });
    },
  };
}

(async () => {
  let requestedOptions;
  const success = await requestCurrentLocation(
    successProvider(
      { latitude: 13.3611, longitude: 100.9847, accuracy: 18 },
      (options) => { requestedOptions = options; },
    ),
    { now: () => '2026-07-14T00:00:00.000Z' },
  );

  assert.equal(success.ok, true);
  assert.deepEqual(success.location, {
    latitude: 13.3611,
    longitude: 100.9847,
    accuracyMeters: 18,
    googleMapsUrl: 'https://www.google.com/maps?q=13.3611,100.9847',
    capturedAt: '2026-07-14T00:00:00.000Z',
  });
  assert.deepEqual(requestedOptions, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
  });

  const noAccuracy = await requestCurrentLocation(
    successProvider({ latitude: 13.1, longitude: 100.1 }),
    { now: () => '2026-07-14T00:00:00.000Z' },
  );
  assert.equal(noAccuracy.location.accuracyMeters, null);

  const unsupported = await requestCurrentLocation(null);
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.code, 'unsupported');
  assert.ok(unsupported.messageTh.includes('HTTPS'));
  assert.ok(unsupported.messageTh.includes('พิมพ์พื้นที่'));

  const denied = await requestCurrentLocation(errorProvider(1));
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'permission_denied');
  assert.ok(denied.messageTh.includes('ไม่ได้แชร์ตำแหน่ง'));

  const unavailable = await requestCurrentLocation(errorProvider(2));
  assert.equal(unavailable.ok, false);
  assert.equal(unavailable.code, 'position_unavailable');
  assert.ok(unavailable.messageTh.includes('ไม่พบตำแหน่ง'));

  const timedOut = await requestCurrentLocation(errorProvider(3));
  assert.equal(timedOut.ok, false);
  assert.equal(timedOut.code, 'timeout');
  assert.ok(timedOut.messageTh.includes('ใช้เวลานานเกินไป'));

  const unknown = await requestCurrentLocation(errorProvider(99));
  assert.equal(unknown.ok, false);
  assert.equal(unknown.code, 'unknown');

  console.log('PASS current-location lead capture rules');
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});
