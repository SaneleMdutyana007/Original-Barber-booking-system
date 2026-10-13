-- ============================================================
-- 0006_seed.sql — demo content
-- ============================================================

insert into public.services (name, slug, description, duration_minutes, price_zar, image_alt, sort_order) values
  ('Classic Haircut',    'classic-haircut',    'Scissor cut, wash, and blow dry tailored to your head shape.', 45, 220.00, 'Barber giving a classic scissor haircut to a seated client', 1),
  ('Skin Fade',          'skin-fade',          'Precision clipper fade blended to skin, finished with a razor line-up.', 40, 240.00, 'Close-up of a barber creating a skin fade with clippers', 2),
  ('Beard Trim & Shape', 'beard-trim-shape',   'Beard trimmed, shaped, oiled, and finished with a hot towel.', 30, 160.00, 'Barber shaping a client''s beard with a straight razor', 3),
  ('Hot Towel Shave',    'hot-towel-shave',    'Traditional straight-razor shave with hot towels and after-balm.', 50, 280.00, 'Traditional straight razor shave with hot towel on a client''s face', 4),
  ('Father & Son Cut',   'father-and-son-cut', 'Two classic cuts booked back-to-back. Perfect Saturday treat.', 90, 380.00, 'Father and son sitting side by side getting haircuts', 5)
on conflict (slug) do nothing;

insert into public.barbers (display_name, bio, specialties, photo_alt, is_active) values
  ('Thabo M.',  'Ten years behind the chair. Specialist in textured crops and afro shaping.', '{"Afro","Textured crop","Line-up"}',  'Barber Thabo smiling in a black apron', true),
  ('Riaan V.',  'Cape Town''s fade specialist. Trained in London, cutting since 2012.',       '{"Skin fade","Scissor cut","Beard"}', 'Barber Riaan holding clippers', true),
  ('Sipho K.',  'Master of the classic hot towel shave and beard sculpting.',                 '{"Hot towel shave","Beard","Grooming"}', 'Barber Sipho with a straight razor and hot towel', true)
on conflict do nothing;

insert into public.faqs (question, answer, category, sort_order) values
  ('How do I book an appointment?', 'Use the Book Now button, choose a service, pick your barber, then select a slot and pay securely with PayFast. You''ll see a confirmation instantly.', 'Booking & Payment', 1),
  ('What payment methods do you accept?', 'All PayFast-supported methods in South African Rand: Visa, Mastercard, Instant EFT, SnapScan, and Mobicred.', 'Booking & Payment', 2),
  ('Can I cancel my booking?', 'Yes. Log in to your dashboard and click Request Cancellation. Our team reviews cancellation requests within 1 business hour.', 'Cancellations', 3),
  ('Can I reschedule?', 'Yes. In your dashboard choose Request Reschedule, pick a new slot, and we''ll approve or suggest an alternative within 1 business hour.', 'Rescheduling', 4),
  ('What is your cancellation policy?', 'Cancellations more than 24 hours before the appointment receive a full refund. Inside 24 hours we retain 50% to cover the barber''s time.', 'Cancellations', 5),
  ('How long does a haircut take?', 'A classic haircut is 45 minutes. A skin fade is 40. A hot towel shave is 50. Exact durations are shown on each service page.', 'General', 6),
  ('Do you have loyalty rewards?', 'Yes. Every fifth booking earns a free beard trim. Rewards are tracked automatically in your dashboard.', 'Loyalty', 7),
  ('Is the shop wheelchair accessible?', 'Yes, our entrance and cutting chairs are wheelchair accessible. Please note it in the booking notes so we can prepare.', 'Accessibility', 8),
  ('How do I leave a review?', 'After your appointment, your dashboard shows a Leave a Review button for that booking. Reviews are verified and appear once published.', 'Reviews', 9),
  ('How quickly do you respond to enquiries?', 'We respond to all booking requests within 2 business hours (Mon–Sat). Reschedule and cancellation requests within 1 business hour.', 'General', 10),
  ('Where are you located?', 'We''re in the heart of Cape Town CBD. Use the Get Directions button on our contact page to open your maps app.', 'General', 11),
  ('Do you cut children''s hair?', 'Yes. Book our Father & Son Cut or book a Classic Haircut for your child. We''re patient with first-timers.', 'General', 12)
on conflict do nothing;

insert into public.case_studies (title, slug, client_name, summary, body_html, image_alt, published, sort_order) values
  ('From Corporate to Confident',   'corporate-to-confident',   'Liam D.',   'Liam came in for a conservative fade before a big interview. He left with a cut that landed the job.', '<p>Liam works in finance and needed something sharp but not aggressive. We paired a #1 skin fade with a scissor-trimmed top and a natural line-up. He came back a week later to say he''d been hired.</p>', 'Before and after of a client''s corporate fade haircut', true, 1),
  ('The Wedding Beard',             'the-wedding-beard',        'Kagiso M.', 'Kagiso wanted a beard worthy of his wedding photos. We spent six weeks shaping it.', '<p>Six weeks out from his wedding, Kagiso started a structured beard program at our shop. We shaped, oiled, and trained the beard weekly. On the day, the photos spoke for themselves.</p>', 'Groomed beard on a groom on his wedding day', true, 2),
  ('Father and Son Saturdays',      'father-and-son-saturdays', 'The Pillays','A weekly ritual that turned into a family tradition.', '<p>Every Saturday at 09:00, Mr Pillay and his son take adjacent chairs. Two Classic Haircuts, one ritual. We''ve watched the son grow from a nervous toddler to a confident eight-year-old.</p>', 'Father and son in adjacent barber chairs getting haircuts', true, 3)
on conflict (slug) do nothing;

insert into public.page_meta (path, title, description) values
  ('/',                  'Book a Barber in Cape Town | BarberShop ZA',          'Book your next haircut online in Cape Town. Real reviews, instant confirmation, secure PayFast payment in ZAR.'),
  ('/services',          'Haircut & Grooming Services | BarberShop ZA',        'Browse our full grooming menu: fades, beard trims, hot towel shaves. Transparent South African Rand pricing.'),
  ('/barbers',           'Meet Our Barbers | BarberShop ZA',                   'Meet the team: Thabo, Riaan, and Sipho. Ten years each behind the chair. Book your favourite barber online.'),
  ('/book',              'Book Your Appointment | BarberShop ZA',              'Choose your service, barber, and slot. Pay securely with PayFast. Booking confirmed in seconds.'),
  ('/case-studies',      'Client Stories | BarberShop ZA',                     'Real clients, real transformations. Read how local Cape Town clients found their look with us.'),
  ('/faqs',              'Booking FAQs | BarberShop ZA',                       'Answers about bookings, cancellations, rescheduling, payment, and loyalty rewards at BarberShop ZA.'),
  ('/reviews',           'Verified Reviews | BarberShop ZA',                   'Read verified reviews from real clients who booked and paid through BarberShop ZA.'),
  ('/contact',           'Contact & Directions | BarberShop ZA',               'Find us in Cape Town CBD. Get directions, opening hours, and our 2-hour response promise.'),
  ('/privacy-policy',    'Privacy Policy | BarberShop ZA',                     'How BarberShop ZA collects, uses, and protects your personal information under POPIA.'),
  ('/login',             'Log In | BarberShop ZA',                             'Log in to manage your bookings, request reschedules, and leave reviews.'),
  ('/signup',            'Create Account | BarberShop ZA',                     'Create your BarberShop ZA account to book faster and track your loyalty rewards.')
on conflict (path) do nothing;