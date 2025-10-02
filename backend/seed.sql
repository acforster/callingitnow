-- CallingItNow Realistic & Shuffled Database Seed Script
-- This script wipes all prediction-related data and inserts 40 new records.
-- WARNING: This permanently deletes data from the specified tables.

-- Step 1: Clear existing prediction-related data
DELETE FROM votes;
DELETE FROM backings;
DELETE FROM predictions;

-- Step 2: Reset the ID counters
ALTER SEQUENCE predictions_prediction_id_seq RESTART WITH 1;
ALTER SEQUENCE votes_vote_id_seq RESTART WITH 1;
ALTER SEQUENCE backings_backing_id_seq RESTART WITH 1;

-- Step 3: Insert new data (assumes user_id=1 exists)
INSERT INTO predictions (user_id, title, content, category, visibility, allow_backing, timestamp, hash, contains_profanity) VALUES
-- Shuffled Predictions
(1, 'I''m calling it, the Leafs are gonna hoist the Cup in the next 3 years.', 'The curse has to break eventually, right? With this core, it''s just a matter of time.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_1', false),
(1, 'It feels inevitable that a Schitt''s Creek reunion movie gets announced soon.', 'The cast and creator have all hinted they''re open to it. The demand is just too high to ignore.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_1', false),
(1, 'Denis Villeneuve is 100% going to direct a James Bond movie.', 'After Dune and Blade Runner, he''s the only choice to make a truly smart, stylish Bond film.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_1', false),
(1, 'Drake is gonna drop a surprise album this year, no warning.', 'It''s his classic move. One random Thursday night, boom, a whole new album to dominate the charts.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_1', false),
(1, 'Honestly, the Raptors are dark horses for the ECF next season.', 'Scottie is just getting started and the young guys are developing way faster than anyone expected.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_2', false),
(1, 'Tim Hortons is definitely bringing back the Dutchie.', 'They know everyone wants it. They''ll bring it back for a "limited time" and make a killing.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_2', false),
(1, 'Pitter patter, let''s get at ''er. Another Letterkenny spin-off is coming.', 'The world Jared Keeso built is too rich. After the success of ''Shoresy'', another one is a no-brainer.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_2', false),
(1, 'Ryan Reynolds is totally buying a stake in a Canadian sports team.', 'He''s already done it with Wrexham. My money is on him getting involved with the Ottawa Senators.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_2', false),
(1, 'No doubt in my mind the Grey Cup stays in Canada this year.', 'The Bombers are looking strong, but don''t sleep on the Argos. Either way, an American team isn''t winning it.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_3', false),
(1, 'Some Canadian reality show is gonna blow up in the States.', 'Probably something like ''The Great Canadian Baking Show''. It''s just a matter of time before a US network copies a hit.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_4', false),
(1, 'The Jays are taking the AL East this year.', 'Vladdy and Bo are gonna mash, and our pitching is finally solid enough to last a full season.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_4', false),
(1, 'An indie film shot in Newfoundland is going to be a surprise hit.', 'The scenery and culture there are just unreal. Someone''s going to make a small movie that gets huge attention.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_3', false),
(1, 'McDavid is 100% breaking one of Gretzky''s "unbreakable" records.', 'He''s just playing on a different planet. It''s not a matter of if, but when.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_5', false),
(1, 'Love the show, but Murdoch Mysteries has to be announcing its final season soon.', 'It''s had an incredible run, but all good things must come to an end. I bet they announce it this year.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_3', false),
(1, 'The TIFF People''s Choice winner is going to win the Best Picture Oscar.', 'It happens so often it''s barely a prediction anymore. The festival is the ultimate Oscar bellwether.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_4', false),
(1, 'After that Olympic gold, there''s no way our women''s soccer team doesn''t medal at the next World Cup.', 'The momentum and talent are there. They''re a lock for at least a bronze.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_6', false),
(1, 'The next season of ''Sort Of'' is going to win an international Emmy.', 'It''s so critically acclaimed and well-written. It''s exactly the kind of show that wins major international awards.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_5', false),
(1, 'The Habs rebuild is almost over. They''ll sneak into a wildcard spot next season.', 'Don''t laugh. Their young core is gelling and they''ll be competitive enough to make the playoffs.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_7', false),
(1, 'A new Trailer Park Boys movie is coming.', 'The boys will be back for another feature-length movie. It''s an easy money-maker for them.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_5', false),
(1, 'Okay, hear me out: the CFL finally announces the Atlantic Schooners.', 'The dream of a team in Halifax is alive. The league needs a tenth team and this is the year they do it.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_8', false),
(1, 'CBC is gonna launch a new historical drama to compete with ''The Crown''.', 'They''ll pour a huge budget into a series about something like the building of the railway. It''s a prestige play.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_6', false),
(1, 'Elliot Page is going to direct his first feature film.', 'After so many amazing performances, he''s definitely going to step behind the camera for a personal project soon.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_6', false),
(1, 'Kim''s Convenience is coming back as an animated series.', 'It''s the perfect way to get the cast back together and continue the story without the live-action drama.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_7', false),
(1, 'A major Hollywood blockbuster will be entirely animated in Montreal.', 'Montreal is already a huge animation hub. One of the studios there is going to land a full Disney or Pixar-level movie.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_7', false);