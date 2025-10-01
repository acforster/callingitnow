import hashlib
import json
from datetime import datetime
from sqlalchemy.orm import Session
from database import engine, Base
from models import User, Prediction

# --- Data to be Seeded ---
SEED_DATA = [
    # Sports
    {"category": "Sports", "title": "The Lakers will miss the playoffs next season.", "content": "Even with their star players, the Western Conference is too competitive. I predict they'll finish outside the top 8."},
    {"category": "Sports", "title": "The Kansas City Chiefs will win the next Super Bowl.", "content": "Patrick Mahomes is in a league of his own. As long as he's healthy, they are the clear favorites."},
    {"category": "Sports", "title": "A European team will win the 2026 FIFA World Cup.", "content": "The depth of talent in teams like France, Spain, and England is currently unmatched by South American powerhouses."},
    {"category": "Sports", "title": "The Boston Celtics will win an NBA championship within 2 years.", "content": "Their core duo is entering their prime, and they have the defensive identity and coaching to go all the way."},
    {"category": "Sports", "title": "Formula 1 will have a new champion next year.", "content": "Red Bull's era of dominance is bound to be challenged. I'm betting on a resurgence from either Ferrari or McLaren."},
    {"category": "Sports", "title": "The New York Yankees will finally win a World Series this decade.", "content": "Their spending power and young talent pipeline will eventually align to break their championship drought."},
    {"category": "Sports", "title": "Cricket's T20 format will be added to the Olympic Games by 2032.", "content": "The IOC is looking for sports with global appeal and high viewership, and T20 cricket fits the bill perfectly."},
    {"category": "Sports", "title": "A rookie will win the NFL MVP award in the next 5 seasons.", "content": "With the game becoming more quarterback-centric, a transcendent rookie talent could take the league by storm immediately."},
    {"category": "Sports", "title": "eSports prize pools will surpass the Super Bowl winner's prize money.", "content": "The growth of competitive gaming is exponential. Major tournaments for games like Dota 2 or League of Legends will soon offer more prize money than traditional sports."},
    {"category": "Sports", "title": "The UFC will introduce a new weight class for women.", "content": "As the talent pool for female fighters grows, the UFC will likely add a new division to create more championship opportunities."},

    # Television
    {"category": "Television", "title": "The next season of 'Stranger Things' will be its last.", "content": "The story is naturally heading towards a final confrontation. The creators will want to end on a high note rather than drag it out."},
    {"category": "Television", "title": "'The White Lotus' will have a season set in Japan.", "content": "Creator Mike White has hinted at an Eastern setting, and a luxury hotel in Kyoto or Tokyo would be a perfect backdrop for the show's themes."},
    {"category": "Television", "title": "A 'Game of Thrones' sequel about Jon Snow will be released by 2026.", "content": "Despite the mixed reception of the finale, the character's popularity and unresolved story make a sequel almost inevitable for HBO."},
    {"category": "Television", "title": "The next big streaming hit will be a non-English language show.", "content": "Following the success of 'Squid Game' and 'Money Heist', streaming services are investing heavily in international productions to find the next global phenomenon."},
    {"category": "Television", "title": "'Ted Lasso' will get a spin-off series.", "content": "The world and characters are too beloved to disappear completely. I predict a spin-off focusing on AFC Richmond's women's team or another character's journey."},
    {"category": "Television", "title": "Live reality competition shows will make a major comeback on network TV.", "content": "In an on-demand world, the 'event' nature of live television is a huge draw for advertisers. Expect a new 'American Idol'-style hit."},
    {"category": "Television", "title": "The final season of 'The Crown' will be the most-watched season of the series.", "content": "Covering more modern and controversial events will draw in a massive audience, leading to record-breaking viewership for Netflix."},
    {"category": "Television", "title": "A major streaming service will introduce an ad-supported 'free' tier globally.", "content": "As the market becomes saturated, services will look to capture a wider audience by offering a free, ad-supported option, similar to YouTube."},

    # Movies
    {"category": "Movies", "title": "The next James Bond will be an actor who is relatively unknown.", "content": "Producers will want to avoid a big star to allow the actor to be defined by the role, following the tradition of Connery, Moore, and Craig."},
    {"category": "Movies", "title": "An A24 film will win the Oscar for Best Picture within three years.", "content": "The studio consistently produces critically acclaimed and culturally relevant films, and it's only a matter of time before they win the top prize again."},
    {"category": "Movies", "title": "The 'Avatar' sequels will not be as successful as the original.", "content": "While they will make a lot of money, the cultural landscape has changed, and the novelty of the 3D experience won't be enough to recapture the original's historic success."},
    {"category": "Movies", "title": "The Marvel Cinematic Universe will do a full reboot of the X-Men.", "content": "Instead of integrating old actors, Kevin Feige will want a clean slate to build the X-Men from the ground up within the MCU."},
    {"category": "Movies", "title": "A horror movie will be nominated for Best Picture at the Oscars.", "content": "With directors like Jordan Peele and Ari Aster elevating the genre, a horror film will finally break through and get a nomination for the top award."},
    {"category":- "Movies", "title": "Christopher Nolan's next film will not be a blockbuster.", "content": "I predict he will pivot to a smaller, more personal character-driven drama after the massive scale of his recent films."},
    {"category": "Movies", "title": "The 'Fast & Furious' franchise will continue with a new cast.", "content": "The series makes too much money to end. It will be rebooted with a younger cast to continue for another decade."},
    {"category": "Movies", "title": "A movie based on a video game will get a 'fresh' score of over 90% on Rotten Tomatoes.", "content": "With shows like 'The Last of Us' and 'Arcane' proving it can be done, a feature film will finally nail the adaptation and receive widespread critical acclaim."},

    # Pop Culture & General
    {"category": "Pop Culture", "title": "The next major social media app will be focused on audio.", "content": "After the initial hype of Clubhouse, a more refined and persistent audio-based social platform will emerge and gain mass adoption."},
    {"category": "Pop Culture", "title": "Vinyl record sales will continue to grow and outsell CDs for the next 5 years.", "content": "The trend of collecting physical media is not slowing down, and vinyl has established itself as the preferred format for music enthusiasts."},
    {"category": "Pop Culture", "title": "A classic rock band will have a viral moment on TikTok, leading to a chart resurgence.", "content": "Similar to what happened with Fleetwood Mac, a new generation will discover a classic band through a viral trend, catapulting their music back into the mainstream."},
    {"category": "Pop Culture", "title": "The 'metaverse' will be widely considered a failure in its current form.", "content": "The vision pushed by major tech companies is not resonating with the general public. It will need to be re-imagined as a more integrated, less isolating technology."},
    {"category": "General", "title": "Remote work will become the default for over 50% of office jobs in the US.", "content": "Companies will embrace remote work to save on real estate costs and attract a wider talent pool, making it a permanent fixture of the modern economy."},
    {"category": "General", "title": "AI-powered personal assistants will become more common than smart speakers.", "content": "Truly intelligent, proactive AI assistants on our phones and computers will make dedicated smart speakers feel redundant."},
    {"category": "General", "title": "Four-day work weeks will be trialed by a Fortune 500 company.", "content": "As the focus shifts to productivity and employee well-being, a major corporation will experiment with a four-day work week to study its effects."},
    {"category": "General", "title": "Lab-grown meat will be available in major US supermarkets by 2028.", "content": "Regulatory hurdles will be cleared, and production will scale up, making lab-grown meat a viable and accessible option for consumers."},
    {"category": "General", "title": "Augmented Reality glasses will finally have their 'iPhone moment'.", "content": "A company, likely Apple, will release a pair of AR glasses that are stylish, functional, and intuitive, leading to mass adoption."},
    {"category": "General", "title": "The global supply chain will become significantly more localized.", "content": "Recent disruptions have highlighted the fragility of the global supply chain, and countries will invest heavily in localizing production for critical goods."},
    {"category": "General", "title": "Personalized medicine based on genetic markers will become standard.", "content": "Doctors will routinely use a patient's genetic information to prescribe drugs and treatments, leading to more effective and personalized healthcare."},
    {"category": "General", "title": "Electric vehicle charging stations will be more common than gas stations in some cities.", "content": "In progressive, densely populated urban areas, the infrastructure for EVs will surpass that of traditional gasoline cars."}
]

def generate_prediction_hash(user_id: int, title: str, content: str, timestamp: datetime) -> str:
    """Generates a SHA256 hash for a prediction."""
    data = {
        "user_id": user_id,
        "title": title,
        "content": content,
        "timestamp": timestamp.isoformat()
    }
    encoded_data = json.dumps(data, sort_keys=True).encode('utf-8')
    return hashlib.sha256(encoded_data).hexdigest()

def seed_database():
    """Clears existing predictions and seeds the database with new ones."""
    db: Session = next(get_db())
    
    print("Checking for existing user...")
    # This script assumes a user with user_id=1 exists.
    # In a real application, you might want to create a user here if one doesn't exist.
    user = db.query(User).filter(User.user_id == 1).first()
    if not user:
        print("ERROR: User with user_id=1 not found. Please create a user before seeding.")
        return

    print("User found. Deleting old prediction data...")
    db.query(Prediction).delete()
    db.commit()
    print("Old data deleted.")

    print(f"Seeding database with {len(SEED_DATA)} new predictions...")
    
    for item in SEED_DATA:
        now = datetime.utcnow()
        # Note: We are using the original title/content for the hash
        hash_value = generate_prediction_hash(
            user_id=user.user_id,
            title=item["title"],
            content=item["content"],
            timestamp=now
        )
        
        new_prediction = Prediction(
            user_id=user.user_id,
            title=item["title"],
            content=item["content"],
            category=item["category"],
            hash=hash_value,
            timestamp=now,
            contains_profanity=False  # All seed data is clean
        )
        db.add(new_prediction)

    db.commit()
    print("Database seeding complete!")

if __name__ == "__main__":
    # This allows the script to be run from the command line
    seed_database()