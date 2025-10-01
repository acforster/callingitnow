-- CallingItNow Canadian-Themed Database Seed Script
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
-- Sports (Canadian)
(1, 'The Toronto Maple Leafs will win the Stanley Cup within 3 years.', 'With their core group of players, it''s only a matter of time before they break the curse and make a serious run for the Cup.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_1', false),
(1, 'The Toronto Raptors will make it to the Eastern Conference Finals next season.', 'Their young talent is developing faster than expected. They''ll be a surprise contender.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_2', false),
(1, 'A Canadian team will win the Grey Cup this year.', 'Whether it''s the Bombers, Argos, or another contender, the Grey Cup is staying in Canada.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_3', false),
(1, 'The Toronto Blue Jays will win the AL East.', 'Their combination of pitching and power hitting will be too much for the Yankees and Red Sox to handle over a full season.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_4', false),
(1, 'Connor McDavid will break a Gretzky record.', 'He is the best player in the world and is on pace to shatter one of the Great One''s seemingly untouchable records.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_5', false),
(1, 'Canada''s National Women''s Soccer Team will medal at the next World Cup.', 'After their Olympic gold, the momentum and talent are there to make a deep run at the World Cup.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_6', false),
(1, 'The Montreal Canadiens will return to the playoffs next season.', 'After a few years of rebuilding, their young core will be ready to compete for a playoff spot.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_7', false),
(1, 'A new CFL team will be announced for Atlantic Canada.', 'The long-held dream of a CFL team in Halifax or Moncton will finally become a reality, expanding the league to ten teams.', 'Sports', 'PUBLIC', true, NOW(), 'hash_ca_sports_8', false),

-- Television (Canadian)
(1, 'A ''Schitt''s Creek'' reunion movie will be announced.', 'The cast and creator have hinted they''re open to it. The demand is there for a follow-up movie.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_1', false),
(1, 'Letterkenny will get another spin-off series.', 'The universe Jared Keeso has built is rich with characters. Expect another spin-off to follow the success of ''Shoresy''.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_2', false),
(1, '''Murdoch Mysteries'' will announce its final season.', 'The show has had an incredible run, but all good things must come to an end. The announcement is coming soon.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_3', false),
(1, 'A Canadian reality show will become a hit in the US.', 'Similar to ''The Great Canadian Baking Show'', another Canadian reality format will be picked up and find a large audience south of the border.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_4', false),
(1, 'The next season of ''Sort Of'' will win an international Emmy.', 'The show''s critical acclaim and groundbreaking storytelling will be recognized with a major international award.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_5', false),
(1, 'CBC will launch a new historical drama to rival ''The Crown''.', 'The CBC will invest in a high-budget series about a significant period in Canadian history, like the building of the CPR or the War of 1812.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_6', false),
(1, 'Kim''s Convenience will return as an animated series.', 'An animated format would be a great way to continue the story and bring the cast back together without the challenges of a live-action production.', 'Television', 'PUBLIC', true, NOW(), 'hash_ca_tv_7', false),

-- Movies (Canadian)
(1, 'Denis Villeneuve will direct a James Bond film.', 'After his success with Dune and Blade Runner 2049, he is the perfect choice to helm a stylish, intelligent Bond film.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_1', false),
(1, 'Ryan Reynolds will buy an ownership stake in a Canadian sports team.', 'Following his success with Wrexham AFC, he''ll bring his business and marketing savvy to a Canadian team, likely the Ottawa Senators or Vancouver Canucks.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_2', false),
(1, 'A film shot in Newfoundland will be a surprise indie hit.', 'The unique landscape and culture of Newfoundland will be the backdrop for a critically acclaimed independent film that captures international attention.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_3', false),
(1, 'The TIFF People''s Choice winner will win the Best Picture Oscar.', 'The Toronto International Film Festival is a key indicator for Oscar success, and the trend will continue with the next winner.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_4', false),
(1, 'A new ''Trailer Park Boys'' movie will be released.', 'The boys will return for another feature-length film, bringing their unique brand of chaos back to the big screen.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_5', false),
(1, 'Elliot Page will direct his first feature film.', 'After years of acclaimed performances, Elliot Page will step behind the camera to direct a personal and powerful feature film.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_6', false),
(1, 'A major Hollywood blockbuster will be entirely animated in Montreal.', 'Montreal is a global hub for animation and VFX. A studio there will land a contract to animate a full blockbuster for a major studio like Disney or Warner Bros.', 'Movies', 'PUBLIC', true, NOW(), 'hash_ca_movies_7', false),

-- Pop Culture & General (Canadian)
(1, 'Drake will release a surprise album with no prior announcement.', 'Following his own trend, he will drop a full album overnight, dominating charts and conversation.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_1', false),
(1, 'Tim Hortons will bring back the Dutchie.', 'After years of public demand, Tim Hortons will finally bring back the classic Dutchie donut as a limited-time offer.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_2', false),
(1, 'The housing market in a major Canadian city will see a significant correction.', 'The bubble has to pop eventually. I predict prices in either Toronto or Vancouver will drop by over 15% in a single year.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_3', false),
(1, 'A Canadian artist will have the song of the summer.', 'A track from a Canadian artist, whether it''s The Weeknd, Tate McRae, or a newcomer, will dominate the charts all summer long.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_4', false),
(1, 'Shopify will acquire a major social media company.', 'To further integrate e-commerce and social selling, Shopify will make a bold move and acquire a platform like Pinterest or TikTok.', 'Pop Culture', 'PUBLIC', true, NOW(), 'hash_ca_pop_5', false),
(1, 'The Canadian government will implement a form of Universal Basic Income.', 'Pilot projects will prove successful, leading to a broader, federally supported UBI program within the next decade.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_1', false),
(1, 'A new national park will be established in the James Bay Lowlands.', 'To protect one of the world''s largest wetlands, a new national park will be created in Northern Ontario.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_2', false),
(1, 'The Green Party of Canada will win a seat outside of British Columbia.', 'The party will finally have an electoral breakthrough in another province, likely in the Maritimes or Ontario.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_3', false),
(1, 'High-speed rail will be approved for the Quebec City-Windsor corridor.', 'After decades of debate, the federal and provincial governments will finally commit to building a high-speed rail line connecting Canada''s busiest corridor.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_4', false),
(1, 'Canada will decriminalize all drugs for personal use nationwide.', 'Following the model of British Columbia, the federal government will adopt a health-based approach to substance use nationwide.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_5', false),
(1, 'The Northwest Passage will become a regularly used commercial shipping route.', 'As Arctic ice continues to melt, shipping companies will begin to use the Northwest Passage as a viable alternative to the Panama Canal.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_6', false),
(1, 'A Canadian company will become a world leader in carbon capture technology.', 'With its engineering talent and natural resources, a Canadian startup will develop a breakthrough in carbon capture that is adopted globally.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_7', false),
(1, 'The population of a Maritime province will grow by over 10% in 5 years.', 'Driven by immigration and inter-provincial migration, a province like Nova Scotia or New Brunswick will experience a significant population boom.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_8', false),
(1, 'The loonie will reach parity with the US dollar again.', 'A combination of rising oil prices and a weakening US dollar will cause the Canadian dollar to climb back to parity.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_9', false),
(1, 'Vancouver will implement a congestion charge for its downtown core.', 'To combat traffic and reduce emissions, the city will follow the lead of London and Singapore by charging vehicles to enter the downtown area.', 'General', 'PUBLIC', true, NOW(), 'hash_ca_gen_10', false);