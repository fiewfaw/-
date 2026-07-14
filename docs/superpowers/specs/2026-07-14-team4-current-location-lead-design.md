# Team 4 Current Location Lead Design

**Date:** 2026-07-14  
**Status:** Approved design, awaiting written-spec review  
**Applies to:** `care-app/public/team4-walk-confidence-mockup.html`

## Goal

Allow a user receiving a personalized Team 4 plan to attach their current location to the lead form with one clear action. The location is optional and supplements, rather than replaces, the existing manually entered service area.

## User Experience

The lead form keeps the existing fields for name, phone number, and district or accommodation area. Directly below the area field, add a secondary action labeled **“ใช้ตำแหน่งปัจจุบัน”**.

When the user presses the action:

1. The browser asks for location permission.
2. While waiting, the action shows a short loading state and cannot be pressed repeatedly.
3. On success, the form shows **“ปักหมุดตำแหน่งแล้ว”** and a link labeled **“ดูตำแหน่งบน Google Maps”**.
4. The user may still edit the area text to add a district, village, landmark, building, or room description.
5. The location is included when the personalized plan is generated.

Location sharing is never required. The user can complete the form using only name, phone number, and manually entered area.

## Data Model

Capture one location snapshot with these fields:

```ts
type LeadLocation = {
  latitude: number
  longitude: number
  accuracyMeters: number | null
  googleMapsUrl: string
  capturedAt: string
}
```

The Google Maps URL uses the coordinate pair and does not require a Maps API key:

```text
https://www.google.com/maps?q={latitude},{longitude}
```

Do not continuously watch the user's position. Do not request background location access.

## States And Error Handling

- **Idle:** Show “ใช้ตำแหน่งปัจจุบัน”.
- **Requesting:** Show “กำลังระบุตำแหน่ง...” and disable the action.
- **Captured:** Show success text and the Google Maps link. Allow the user to press “ระบุตำแหน่งใหม่” if needed.
- **Permission denied:** Explain that location was not shared and keep the manual area field available.
- **Unavailable or timed out:** Explain that the position could not be found and suggest entering the area manually or trying again.
- **Unsupported or insecure context:** Explain that the feature will work on the published secure website and keep manual entry available.

Error messages must not block personalized plan generation.

## Privacy And Delivery Boundary

- Ask for location only after an explicit user press.
- Capture a single point and its stated browser accuracy.
- Do not infer or display a street address through reverse geocoding in this version.
- Do not load an embedded third-party map in this version.
- The current HTML mockup will retain the location only in the open page and include it in the generated case/lead payload.
- Actual delivery to the business requires a later backend or form endpoint. The UI must not claim that the location was sent until that endpoint confirms success.
- Production deployment should use HTTPS; manual area entry remains the fallback in every environment.

## Visual Design

The new control sits inside the existing compact lead form and remains visually secondary to **“สร้างแผนเฉพาะตัวของฉัน”**. A captured location uses the existing teal success treatment. Errors use small inline text and do not introduce a large warning card.

The control must fit a 390-pixel mobile viewport without horizontal overflow or increasing the prominence of the lead form over the clinical plan.

## Testing

Automated checks cover:

- Location control and status elements exist.
- Successful geolocation captures coordinates, accuracy, timestamp, and Google Maps URL.
- Permission denial and timeout preserve manual form completion.
- Re-requesting location replaces the previous snapshot.
- Personalized plan generation includes location when available and still works without it.
- Browser flow has no JavaScript errors or horizontal overflow at 390-pixel mobile and 1440-pixel desktop widths.

## Out Of Scope

- Sending leads to a production database or messaging channel.
- Reverse geocoding coordinates into a postal address.
- Embedded Google Maps picker or draggable pin.
- Continuous or background location tracking.
- Service-area validation or travel-fee calculation.
