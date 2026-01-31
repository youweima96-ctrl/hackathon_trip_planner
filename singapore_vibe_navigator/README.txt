# Singapore Vibe Navigator (狮城漫步) 🇸🇬

**Singapore Vibe Navigator** is an AI-powered personalized travel guide designed to help users explore Singapore based on their current "vibe" or mood. Unlike traditional itinerary planners, this application focuses on the *feeling* of the journey—whether you're looking for a chill afternoon, an energetic adventure, or a melancholic cultural dive.

**狮城漫步 (Singapore Vibe Navigator)** 是一款基于 AI 的个性化旅游向导，旨在根据您当下的“心情”或“氛围”为您规划新加坡的探索之旅。与传统的行程规划不同，本应用更注重旅程的*感受*——无论您是想要一个惬意的下午、一场充满活力的冒险，还是一次忧郁的文化沉浸之旅。

---

## 🌟 Key Features (核心功能)

### 1. 🎭 Mood-Based Route Generation (基于心情的路线生成)
*   **AI Planning**: Select your mood (Chill, Energetic, Foodie, Melancholy, Cultural), duration, and starting point. The AI (GPT-4o) generates a custom walking route tailored to your vibe.
*   **Custom Preferences**: Input specific requests (e.g., "I want to eat chicken rice" or "Quiet parks only") to further customize the route.
*   **Visual Preview**: View your route on an interactive map with optimized markers and paths.

### 2. 📸 Real-Time Visuals (实时景点预览)
*   **Smart Image Fetching**: Automatically fetches high-quality, real photos of attractions using the **Unsplash API**.
*   **Hover Previews**: Simply hover over any map marker to see an instant photo thumbnail of the location.
*   **No Hallucinations**: Strictly uses real search results, avoiding AI-generated fake images.

### 3. 🌍 Community & Social (社区与社交)
*   **Share Plans**: Save your generated itineraries to the community feed.
*   **Meetups (结伴同游)**: Schedule walking tours and invite others to join directly from the app.
*   **Post-Trip Reviews (旅后感)**: Rate your trip, write reviews, and track how your mood changed after the journey (e.g., "Chill ➡️ Energetic").

### 4. 🤖 Smart Search (智能搜索)
*   **AI Recommendations**: Ask for specific types of places (e.g., "Quiet cafe with sea view") and get AI-curated recommendations.
*   **Add to Route**: seamlessly add discovered places to your current itinerary.

### 5. 🎟️ Seamless Payments (无缝支付)
*   **Ticket Integration**: See estimated prices for attractions.
*   **Stripe Integration**: Book tickets directly through the app (simulated via Stripe Sandbox).

---

## 🛠️ Tech Stack (技术栈)

*   **Frontend**: [Streamlit](https://streamlit.io/) (Python-based UI framework)
*   **Map Visualization**: [Folium](https://python-visualization.github.io/folium/) & [Streamlit-Folium](https://github.com/randyzwitch/streamlit-folium)
*   **AI Core**: [OpenAI GPT-4o](https://openai.com/) (Route planning & natural language understanding)
*   **Image Service**: [Unsplash API](https://unsplash.com/developers) (Real-time attraction photos)
*   **Database**: SQLite (User data, plans, meetups, reviews)
*   **Payments**: Stripe API (Payment processing)

---

## 🚀 Getting Started (快速开始)

### Prerequisites (前置要求)
*   Python 3.9+
*   API Keys for: OpenAI, Stripe (Test mode), Unsplash, Google Maps (Optional)

### Installation (安装步骤)

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/singapore-vibe-navigator.git
    cd singapore-vibe-navigator
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # Mac/Linux
    # venv\Scripts\activate  # Windows
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```ini
    OPENAI_API_KEY=your_openai_key
    STRIPE_API_KEY=your_stripe_secret_key
    STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
    UNSPLASH_ACCESS_KEY=your_unsplash_access_key
    GOOGLE_MAPS_API_KEY=your_google_maps_key (Optional)
    ```

5.  **Run the App**:
    ```bash
    streamlit run app.py
    ```

---

## 📸 Screenshots (截图)

*(Add screenshots of the Map, Community Feed, and Review features here)*

---

## 📄 License
This project is open-source and available under the MIT License.
