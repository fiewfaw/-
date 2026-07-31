(function attachCurrentLocationLead(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CurrentLocationLead = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createCurrentLocationLead() {
  const errorMessages = {
    unsupported: 'หน้าปัจจุบันยังใช้ตำแหน่งอัตโนมัติไม่ได้ ฟังก์ชันนี้จะทำงานบนเว็บไซต์ HTTPS และคุณยังพิมพ์พื้นที่แทนได้',
    permission_denied: 'ไม่ได้แชร์ตำแหน่ง คุณยังพิมพ์พื้นที่เองได้ตามปกติ',
    position_unavailable: 'ไม่พบตำแหน่งปัจจุบัน กรุณาลองใหม่หรือพิมพ์พื้นที่แทน',
    timeout: 'การระบุตำแหน่งใช้เวลานานเกินไป กรุณาลองใหม่หรือพิมพ์พื้นที่แทน',
    unknown: 'ระบุตำแหน่งไม่สำเร็จ กรุณาลองใหม่หรือพิมพ์พื้นที่แทน',
  };

  function failure(code) {
    return { ok: false, code, messageTh: errorMessages[code] };
  }

  function normalizeError(error) {
    if (!error) return failure('unknown');
    if (error.code === 1) return failure('permission_denied');
    if (error.code === 2) return failure('position_unavailable');
    if (error.code === 3) return failure('timeout');
    return failure('unknown');
  }

  function requestCurrentLocation(geolocation, options = {}) {
    if (!geolocation || typeof geolocation.getCurrentPosition !== 'function') {
      return Promise.resolve(failure('unsupported'));
    }

    const now = typeof options.now === 'function'
      ? options.now
      : () => new Date().toISOString();

    return new Promise((resolve) => {
      try {
        geolocation.getCurrentPosition(
          (position) => {
            const latitude = Number(position.coords.latitude);
            const longitude = Number(position.coords.longitude);
            const accuracy = Number(position.coords.accuracy);
            resolve({
              ok: true,
              location: {
                latitude,
                longitude,
                accuracyMeters: Number.isFinite(accuracy) ? accuracy : null,
                googleMapsUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
                capturedAt: now(),
              },
            });
          },
          (error) => resolve(normalizeError(error)),
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        );
      } catch (_error) {
        resolve(failure('unknown'));
      }
    });
  }

  return { requestCurrentLocation };
});
