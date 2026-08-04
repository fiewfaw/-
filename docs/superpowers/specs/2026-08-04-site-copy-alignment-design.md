# Site Copy Alignment Design

## Goal

Align the public homepage, service article, and marketing handoff language before paid advertising without changing the approved visual design.

## Approved Positioning

- Hero headline: `วางแผนฟื้นฟูการเคลื่อนไหว` / `ให้เหมาะกับแต่ละคน`
- Hero supporting copy: `กายภาพบำบัดถึงบ้าน สำหรับผู้สูงอายุ ผู้ป่วยระบบประสาท และผู้ที่กำลังฟื้นตัวหลังเจ็บป่วยหรือผ่าตัด`
- Keep prices visible before users decide to contact LINE OA.
- Care Navigator is the preferred first step, followed by LINE OA for a free initial conversation.
- Avoid guarantees, fixed recovery claims, and language implying every patient receives the same technique.

## Homepage Changes

### Free entry service

Rename `ประเมินฟรี` to `ปรึกษาเบื้องต้นฟรี`.

Use these promises only:

- Discuss the current problem and goal.
- Explain suitable service options, process, and prices.
- No purchase obligation.
- It is not a physical examination, diagnosis, treatment session, or personalized exercise prescription.
- It is not conditional on content creation or a review.

### Ten-visit course

- Keep the approved price at 12,000 baht.
- Show 1,200 baht per visit.
- Change the saving claim from 52% to 20%, calculated against ten single visits at 1,500 baht.
- Replace the fixed-outcome statement with `ดูแลต่อเนื่อง 10 ครั้ง ภายใน 2 เดือน`.
- Replace `ลง Manual ทุกครั้ง` with `Manual Technique เมื่อเหมาะสม`.
- Describe treatment as assessment-led and adjusted to the patient's condition rather than identical full treatment every visit.

## Service Article Changes

Update `content/posts/กายภาพบำบัดถึงบ้าน-ชลบุรี.md` so its customer journey and prices match the homepage:

1. Start with Care Navigator.
2. Review the initial plan and public prices.
3. Send the result through LINE OA for a free initial conversation.
4. Book an in-home assessment when appropriate.
5. Receive an assessment-led treatment and home plan.

The article must list only the current services: free initial conversation, online consultation at 500 baht per 30 minutes, single home visit at 1,500 baht, and ten visits at 12,000 baht.

## Verification

- Extend the existing Node content check to assert the approved headline, service labels, prices, 20% calculation, and Care Navigator-first journey.
- Explicitly reject the retired phrases: `Stroke ดีขึ้นได้`, `แลก content + รีวิว`, `52%`, `ผลลัพธ์เร็วสุด`, `ลง Manual ทุกครั้ง`, the 7,500-baht course, and the 2,500-baht program.
- Verify the public homepage and article after deployment.

