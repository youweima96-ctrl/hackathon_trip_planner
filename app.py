import streamlit as st
import folium
from streamlit_folium import st_folium
import os
import json
import random
import re
import time
import requests
import concurrent.futures
from openai import OpenAI
from dotenv import load_dotenv
import database

# --- 1. Configuration & Setup ---
load_dotenv()

# Page Config
st.set_page_config(
    page_title="Singapore Vibe Navigator",
    page_icon="🇸🇬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# OpenAI Client
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    st.error(f"OpenAI API Key Error: {e}")

# --- 2. Constants & Data ---

# Real Ticket Prices (2025 Estimates)
TICKET_PRICES = {
    "Gardens by the Bay": "SGD $53",
    "Flower Dome": "SGD $32",
    "Cloud Forest": "SGD $32",
    "Marina Bay Sands Skypark": "SGD $32",
    "ArtScience Museum": "SGD $25",
    "National Museum of Singapore": "SGD $15",
    "National Gallery Singapore": "SGD $20",
    "Singapore Flyer": "SGD $40",
    "Singapore Zoo": "SGD $48",
    "Night Safari": "SGD $55",
    "River Wonders": "SGD $42",
    "Bird Paradise": "SGD $48",
    "S.E.A. Aquarium": "SGD $44",
    "Universal Studios Singapore": "SGD $88",
    "Asian Civilisations Museum": "SGD $15"
}

# Key Locations for Start Points
START_LOCATIONS = {
    "NUS (National University of Singapore)": [1.2966, 103.7764],
    "MBS (Marina Bay Sands)": [1.2847, 103.8610],
    "Changi Airport": [1.3644, 103.9915],
    "Orchard Road": [1.3048, 103.8318],
    "Chinatown": [1.2842, 103.8436]
}

# --- 3. Custom CSS ---
st.markdown("""
<style>
    /* Import Google Font */
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

    /* 1. Global Reset & High Contrast Defaults */
    html, body, .stApp {
        background-color: #ffffff !important;
        color: #4a69bd !important;
        font-family: 'Poppins', sans-serif;
    }

    /* 2. Force ALL text elements to Muted Blue */
    h1, h2, h3, h4, h5, h6, p, label, li, span, div, caption, small {
        color: #4a69bd !important;
        text-shadow: none !important;
    }
    
    /* Exception: Text inside components that have dark backgrounds (like Buttons/Toasts) */
    
    /* 3. Sidebar: Light Gray Background, Muted Blue Border */
    [data-testid="stSidebar"] {
        background-color: #ffffff !important;
        border-right: 3px solid #4a69bd; /* Muted Blue */
    }
    [data-testid="stSidebar"] * {
        color: #4a69bd !important;
    }
    
    /* 4. Buttons (Muted Blue Background, White Text) */
    div.stButton > button {
        background-color: #4a69bd !important;
        border: 2px solid #4a69bd !important;
        border-radius: 8px;
        padding: 0.6rem 1.5rem;
        font-weight: 700;
        text-transform: uppercase;
        box-shadow: 4px 4px 0px #4a69bd; /* Hard Shadow */
        transition: all 0.1s ease;
    }
    /* Text inside buttons MUST be White */
    div.stButton > button p, div.stButton > button span, div.stButton > button {
        color: #ffffff !important;
    }
    
    div.stButton > button:hover {
        background-color: #ffffff !important;
        color: #4a69bd !important;
        transform: translate(2px, 2px);
        box-shadow: 2px 2px 0px #4a69bd;
    }
    /* Hover text becomes Muted Blue */
    div.stButton > button:hover p, div.stButton > button:hover span {
        color: #4a69bd !important;
    }

    /* 5. Inputs (Text, Selectbox, Slider, TextArea) */
    div[data-baseweb="input"] > div, 
    div[data-baseweb="select"] > div, 
    div[data-baseweb="base-input"] > div,
    div[data-baseweb="textarea"] > div {
        background-color: #ffffff !important;
        border: 2px solid #4a69bd !important;
        border-radius: 8px;
        color: #4a69bd !important;
    }
    input, textarea {
        color: #4a69bd !important;
        caret-color: #4a69bd !important;
        background-color: #ffffff !important; 
    }
    /* Placeholder color */
    ::placeholder {
        color: #a4b0be !important;
        opacity: 1;
    }
    /* Dropdown menu items */
    ul[data-baseweb="menu"] li {
        color: #4a69bd !important;
        background-color: #ffffff !important;
    }
    
    /* 6. Metrics */
    [data-testid="stMetricValue"] {
        color: #4a69bd !important;
        font-size: 2.5rem !important;
        font-weight: 900 !important;
    }
    [data-testid="stMetricLabel"] {
        color: #4a69bd !important;
        font-weight: 700;
        text-decoration: underline;
    }
    
    /* 7. Containers & Expanders */
    div[data-testid="stVerticalBlock"] > div[style*="flex-direction: column;"] > div[data-testid="stVerticalBlock"] {
        border: 2px solid #4a69bd;
        box-shadow: 6px 6px 0px #4a69bd;
        border-radius: 12px;
        background-color: #ffffff;
    }
    .streamlit-expanderHeader {
        background-color: #ffffff !important;
        border: 2px solid #4a69bd !important;
        color: #4a69bd !important;
        border-radius: 8px;
    }
    .streamlit-expanderContent {
        border: 2px solid #4a69bd;
        border-top: none;
        border-bottom-left-radius: 8px;
        border-bottom-right-radius: 8px;
        background-color: #ffffff !important;
    }
    /* Force text inside opened expander to be Blue */
    .streamlit-expanderContent p, 
    .streamlit-expanderContent span, 
    .streamlit-expanderContent li, 
    .streamlit-expanderContent div {
        color: #4a69bd !important;
    }
    
    /* 8. Notifications/Toasts */
    div[data-baseweb="notification"], div[data-baseweb="toast"] {
        background-color: #4a69bd !important;
        border: 2px solid #ffffff !important;
    }
    /* Text inside Toast MUST be White - Targeting ALL children */
    div[data-baseweb="notification"] *, div[data-baseweb="toast"] * {
        color: #ffffff !important;
        -webkit-text-fill-color: #ffffff !important;
    }
    
    /* 9. Captions & Small Text */
    div[data-testid="stCaptionContainer"] {
        color: #4a69bd !important;
        font-weight: 600;
        opacity: 1 !important; /* Remove transparency */
    }

    /* 10. Itinerary Location Names (White Text on Muted Blue Header) */
    .streamlit-expanderHeader {
        background-color: #4a69bd !important;
        border: 2px solid #4a69bd !important;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        color: #ffffff !important;
    }
    
    /* EXTREME SPECIFICITY FORCE WHITE TEXT */
    div[data-testid="stExpander"] .streamlit-expanderHeader p,
    div[data-testid="stExpander"] .streamlit-expanderHeader span,
    div[data-testid="stExpander"] .streamlit-expanderHeader div,
    div[data-testid="stExpander"] .streamlit-expanderHeader svg,
    div[data-testid="stExpander"] .streamlit-expanderHeader strong {
        color: #ffffff !important;
        fill: #ffffff !important;
    }

    .streamlit-expanderHeader:hover {
        opacity: 0.9;
    }
    /* Icon in expander header */
    .streamlit-expanderHeader svg {
        fill: #ffffff !important;
        color: #ffffff !important;
    }
</style>
""", unsafe_allow_html=True)

# --- 4. Helper Functions ---

def get_place_image(place_name):
    """Fetch image from Unsplash API."""
    unsplash_key = os.getenv("UNSPLASH_ACCESS_KEY")
    if unsplash_key:
        try:
            # Unsplash Search API
            url = "https://api.unsplash.com/search/photos"
            params = {
                "query": f"{place_name} Singapore",
                "per_page": 1,
                "orientation": "landscape"
            }
            headers = {
                "Authorization": f"Client-ID {unsplash_key}"
            }
            resp = requests.get(url, params=params, headers=headers, timeout=5).json()
            if resp.get("results"):
                # Return small URL for speed
                return resp["results"][0]["urls"]["small"]
        except Exception as e:
            print(f"Unsplash Error: {e}")
            pass

    # Fallback to Placeholder if Unsplash fails
    return f"https://via.placeholder.com/400x300?text={place_name.replace(' ', '+')}"

def get_route_color(mood):
    colors = {
        "Chill (休闲)": "#00b894",      # Green
        "Energetic (活力)": "#d63031",  # Red
        "Foodie (美食)": "#e17055",     # Orange
        "Melancholy (忧郁)": "#0984e3", # Blue
        "Cultural (文化)": "#6c5ce7"    # Purple
    }
    return colors.get(mood, "#2d3436")

def generate_ai_route(start_loc, start_coords, mood, duration, include_museums, custom_pref):
    """Call OpenAI to generate a route."""
    
    museum_prompt = "Include at least one museum or heritage site." if include_museums else ""
    custom_prompt = f"User Specific Preferences: {custom_pref}" if custom_pref else ""
    prices_json = json.dumps(TICKET_PRICES)
    
    prompt = f"""
    Plan a Singapore walking route.
    Start: {start_loc} {start_coords}
    Mood: {mood}
    Duration: {duration} hours.
    {museum_prompt}
    {custom_prompt}
    
    Reference Prices: {prices_json}
    
    Return JSON with key "stops" (list of objects) and "summary":
    - "stops": [
        - "name": Place name
        - "coords": [lat, lon] (Accurate GPS)
        - "desc": Short engaging description in Chinese
        - "price": "Free" or price from Reference Prices (e.g., "SGD $53"). Estimate if missing.
        - "transport_from_prev": (Object, null for first stop) describing how to get here from the previous stop.
            - "method": "Walk" / "Bus" / "MRT" / "Taxi" (in Chinese, e.g. 步行, 巴士, 地铁)
            - "duration": e.g. "10 mins"
            - "cost": e.g. "SGD $0" or "SGD $2.50"
    ]
    - "summary": One sentence summary of the experience/vibe in Chinese (e.g. "这是一趟充满历史感与美食的文化之旅").
    
    Ensure 3-5 stops.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a Singapore travel guide. Output valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return data.get("stops", []), data.get("summary", "")
    except Exception as e:
        st.error(f"AI Generation Failed: {e}")
        return [], ""

def search_place_ai(query, mood):
    """Search for a single place via AI."""
    prompt = f"""
    Recommend ONE place in Singapore for: "{query}"
    Current Mood: {mood}
    
    Return JSON:
    - "name": Place name
    - "coords": [lat, lon]
    - "desc": Why it fits (MUST be in Chinese)
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "system", "content": "Output valid JSON. Use Chinese for descriptions."}, {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        st.error(f"Search Failed: {e}")
        return None

def fetch_images_parallel(route_data):
    """Fetch images for all stops in parallel."""
    def fetch_one(stop):
        # Always fetch from external APIs (Google/Wiki) to ensure real images
        stop["image"] = get_place_image(stop["name"])
        return stop

    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        list(executor.map(fetch_one, route_data))
    
    return route_data

# --- 5. Main Application Logic ---

def main():
    # --- Database Init ---
    database.init_db()

    # --- Session State Initialization ---
    if "route" not in st.session_state:
        st.session_state.route = None
    if "route_summary" not in st.session_state:
        st.session_state.route_summary = ""
    if "search_result" not in st.session_state:
        st.session_state.search_result = None
    if "mood" not in st.session_state:
        st.session_state.mood = "Chill (休闲)"
    if "user" not in st.session_state:
        st.session_state.user = None
    if "start_loc_name" not in st.session_state:
        st.session_state.start_loc_name = "Unknown"

    # --- Sidebar ---
    with st.sidebar:
        st.title("🦁 狮城漫步 (Vibe Navigator)")
        
        # Login / Register
        if st.session_state.user:
            st.success(f"👤 Hi, {st.session_state.user[1]}!")
            if st.button("🚪 退出登录 (Logout)"):
                st.session_state.user = None
                st.rerun()
        else:
            with st.expander("👤 登录 / 注册 (Login)", expanded=True):
                tab_login, tab_reg = st.tabs(["登录", "注册"])
                with tab_login:
                    l_user = st.text_input("用户名", key="l_user")
                    l_pass = st.text_input("密码", type="password", key="l_pass")
                    if st.button("登录", key="btn_login"):
                        user = database.login_user(l_user, l_pass)
                        if user:
                            st.session_state.user = user
                            st.success("登录成功！")
                            st.rerun()
                        else:
                            st.error("用户名或密码错误")
                
                with tab_reg:
                    r_user = st.text_input("用户名", key="r_user")
                    r_pass = st.text_input("密码", type="password", key="r_pass")
                    if st.button("注册", key="btn_reg"):
                        if r_user and r_pass:
                            if database.register_user(r_user, r_pass):
                                st.success("注册成功！请登录。")
                            else:
                                st.error("用户名已存在")
                        else:
                            st.warning("请输入用户名和密码")

        st.markdown("---")
        
        st.subheader("1. 您的旅程")
        start_key = st.selectbox("🚩 出发地", list(START_LOCATIONS.keys()))
        mood = st.select_slider("🎭 今日心情", ["Chill (休闲)", "Energetic (活力)", "Foodie (美食)", "Melancholy (忧郁)", "Cultural (文化)"])
        duration = st.slider("⏱️ 时长 (小时)", 1.0, 6.0, 2.5)
        
        st.subheader("2. 偏好")
        include_museums = st.toggle("🏛️ 包含博物馆/展览", value=False)
        custom_pref = st.text_area("✍️ 其他偏好 (Optional)", placeholder="e.g. 我想吃鸡饭，或者去一个安静的公园", height=70)
        
        st.markdown("---")
        if st.button("🚀 生成路线", use_container_width=True):
            with st.status("🤖 AI 正在思考中... (AI is thinking...)") as status:
                st.write("🗺️ 规划路线中... (Planning Route)")
                start_coords = START_LOCATIONS[start_key]
                route_data, summary = generate_ai_route(start_key, start_coords, mood, duration, include_museums, custom_pref)
                
                if route_data:
                    st.write("🎨 搜索真实景点图片... (Searching Real Images)")
                    route_data = fetch_images_parallel(route_data)
                    
                    st.session_state.route = route_data
                    st.session_state.route_summary = summary
                    st.session_state.mood = mood
                    st.session_state.start_loc_name = start_key
                    st.session_state.search_result = None # Clear previous search
                    
                    status.update(label="✅ 规划完成! (Complete!)", state="complete", expanded=False)
                    st.rerun()

    # --- Main Content ---
    st.title("🇸🇬 新加坡城市漫步指南")
    
    # --- Payment Success Handling ---
    if st.query_params.get("success") == "true":
        st.balloons()
        st.success("🎉 支付成功！您的门票已确认。(Payment Successful!)")
        # Update query param to prevent repeat animations on rerun
        st.query_params["success"] = "false"
        
    elif st.query_params.get("canceled") == "true":
        st.warning("❌ 支付已取消。(Payment Canceled)")
        st.query_params["canceled"] = "false"
    
    # Tabs
    tab_gen, tab_comm, tab_meetup = st.tabs(["🗺️ 行程规划 (Generator)", "🌍 社区分享 (Community)", "🤝 结伴同游 (Meetups)"])
    
    # --- Tab 1: Generator ---
    with tab_gen:
        col1, col2 = st.columns([2, 1])
        
        # --- Left Column: Map ---
        with col1:
            # Initialize Map centered on Singapore
            m = folium.Map(location=[1.3521, 103.8198], zoom_start=11, tiles="OpenStreetMap")
            
            # 1. Plot Route (if exists)
            if st.session_state.route:
                route_coords = []
                route_color = get_route_color(st.session_state.mood)
                
                for idx, stop in enumerate(st.session_state.route):
                    coords = stop.get("coords")
                    name = stop.get("name")
                    price = stop.get("price", "Free")
                    
                    if coords:
                        route_coords.append(coords)
                        
                        # Image is already fetched in parallel step
                        img_url = stop.get("image", "https://via.placeholder.com/300x200?text=Loading")
                        
                        # Custom Marker
                        icon = folium.Icon(color="white", icon_color=route_color, icon="map-marker", prefix="fa")
                        
                        popup_content = f"""
                        <div style='font-family:sans-serif; width:200px;'>
                            <img src="{img_url}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
                            <b>{idx+1}. {name}</b><br>
                            <span style='color:#666; font-size:12px;'>{price}</span>
                        </div>
                        """
                        
                        folium.Marker(
                            location=coords,
                            popup=folium.Popup(popup_content, max_width=200),
                            tooltip=f"""
                            <div style="width:150px;">
                                <img src="{img_url}" style="width:100%; height:100px; object-fit:cover; border-radius:4px;">
                                <div style="margin-top:4px; font-weight:bold;">{name}</div>
                            </div>
                            """,
                            icon=icon
                        ).add_to(m)
                
                # Draw Line
                if len(route_coords) > 1:
                    folium.PolyLine(
                        locations=route_coords,
                        color=route_color,
                        weight=5,
                        opacity=0.8
                    ).add_to(m)
                    
                    m.fit_bounds(route_coords)
            
            # 2. Plot Search Result (if exists)
            if st.session_state.search_result:
                res = st.session_state.search_result
                s_coords = res.get("coords")
                if s_coords:
                    # Fetch Image
                    img_url = get_place_image(res.get("name"))
                    
                    popup_content = f"""
                    <div style='font-family:sans-serif; width:200px;'>
                        <img src="{img_url}" style="width:100%; height:120px; object-fit:cover; border-radius:8px; margin-bottom:8px;">
                        <b>{res.get("name")}</b>
                    </div>
                    """
                    
                    folium.Marker(
                        location=s_coords,
                        popup=folium.Popup(popup_content, max_width=200),
                        tooltip=f"""
                        <div style="width:150px;">
                            <img src="{img_url}" style="width:100%; height:100px; object-fit:cover; border-radius:4px;">
                            <div style="margin-top:4px; font-weight:bold;">{res.get("name")}</div>
                        </div>
                        """,
                        icon=folium.Icon(color="red", icon="star", prefix="fa")
                    ).add_to(m)
                    
                    # Zoom to search result if no route, or just fit bounds
                    if not st.session_state.route:
                        m.location = s_coords
                        m.zoom_start = 15
            
            st_folium(m, width="100%", height=550)

        # --- Right Column: Details & Stats ---
        with col2:
            # Search Box
            with st.container(border=True):
                st.subheader("🤖 灵感搜索")
                query = st.text_input("想找什么？", placeholder="例：安静的看海咖啡馆")
                if st.button("🔍 搜索"):
                    if query:
                        with st.spinner("Searching..."):
                            res = search_place_ai(query, st.session_state.mood)
                            if res:
                                st.session_state.search_result = res
                                st.rerun()
            
            # Search Result Display
            if st.session_state.search_result:
                res = st.session_state.search_result
                st.success(f"**推荐:** {res.get('name')}")
                st.caption(res.get('desc'))
                
                c_add, c_clear = st.columns(2)
                with c_add:
                    if st.button("➕ 加入行程"):
                        if st.session_state.route is None:
                            st.session_state.route = []
                        
                        # Create new stop object
                        new_stop = {
                            "name": res.get("name"),
                            "coords": res.get("coords"),
                            "desc": res.get("desc"),
                            "price": "Check On-site",
                            "transport_from_prev": {
                                "method": "Taxi/Grab", 
                                "duration": "15 mins", 
                                "cost": "Est. SGD $12"
                            }
                        }
                        
                        st.session_state.route.append(new_stop)
                        st.session_state.search_result = None # Clear search
                        st.toast(f"✅ 已将 {res.get('name')} 加入行程！")
                        time.sleep(1)
                        st.rerun()
                
                with c_clear:
                    if st.button("❌ 清除搜索"):
                        st.session_state.search_result = None
                        st.rerun()
            
            st.markdown("---")

            # Route Details
            if st.session_state.route:
                st.subheader("📍 行程单")
                
                # Show Vibe Summary
                if st.session_state.route_summary:
                    st.info(f"✨ **体验总结:** {st.session_state.route_summary}")
                
                total_cost = 0
                
                for idx, stop in enumerate(st.session_state.route):
                    name = stop.get("name")
                    desc = stop.get("desc")
                    price_str = stop.get("price", "Free")
                    
                    # --- Transport Connector (HTML) ---
                    transport = stop.get("transport_from_prev")
                    if transport:
                        method = transport.get("method", "步行")
                        dur = transport.get("duration", "5 mins")
                        t_cost = transport.get("cost", "Free")
                        
                        # Clean Vertical Line + Badge Design
                        st.markdown(f"""
                        <div style="display: flex; flex-direction: column; align-items: center; margin: 0 0 10px 0;">
                            <div style="width: 2px; height: 15px; background-color: #4a69bd; opacity: 0.3;"></div>
                            <div style="
                                font-size: 0.75rem; 
                                color: #4a69bd; 
                                background: #ffffff; 
                                padding: 4px 12px; 
                                border-radius: 20px; 
                                border: 1px solid #4a69bd;
                                font-weight: 600;
                                box-shadow: 0 2px 4px rgba(74, 105, 189, 0.1);
                                z-index: 1;
                            ">
                                {method} <span style="margin: 0 4px; opacity: 0.5;">|</span> {dur} <span style="margin: 0 4px; opacity: 0.5;">|</span> {t_cost}
                            </div>
                            <div style="width: 2px; height: 15px; background-color: #4a69bd; opacity: 0.3;"></div>
                        </div>
                        """, unsafe_allow_html=True)
                    
                    # --- Location Card (Container) ---
                    with st.container(border=True):
                        # Header Row
                        c_title, c_badge = st.columns([0.7, 0.3])
                        with c_title:
                            st.markdown(f"#### {idx+1}. {name}")
                        with c_badge:
                            st.markdown(f"""
                            <div style="text-align: right; font-weight: bold; color: #4a69bd; font-size: 0.85rem; background: #eef2ff; padding: 2px 8px; border-radius: 4px;">
                                {price_str}
                            </div>
                            """, unsafe_allow_html=True)
                        
                        # Description
                        st.markdown(f"<div style='color: #4a69bd; font-size: 0.9rem; margin-bottom: 12px; opacity: 0.9;'>{desc}</div>", unsafe_allow_html=True)
                        
                        # Action Button (if paid)
                        price_val = 0
                        nums = re.findall(r'\d+', price_str)
                        if nums: price_val = int(nums[0])
                        
                        if price_val > 0:
                            # Stripe Payment Link Generation
                            if st.button(f"🎟️ 预订门票 (SGD ${price_val})", key=f"btn_{idx}", use_container_width=True):
                                try:
                                    import stripe
                                    stripe.api_key = os.getenv("STRIPE_API_KEY")
                                    
                                    # Create Checkout Session
                                    session = stripe.checkout.Session.create(
                                        payment_method_types=['card'],
                                        line_items=[{
                                            'price_data': {
                                                'currency': 'sgd',
                                                'product_data': {
                                                    'name': f"Ticket for {name}",
                                                },
                                                'unit_amount': price_val * 100, # Amount in cents
                                            },
                                            'quantity': 1,
                                        }],
                                        mode='payment',
                                        success_url='http://localhost:8501/?success=true',
                                        cancel_url='http://localhost:8501/?canceled=true',
                                    )
                                    
                                    # Store the payment URL in session state to show it
                                    st.session_state[f"pay_link_{idx}"] = session.url
                                    st.rerun()
                                    
                                except Exception as e:
                                    st.error(f"Payment Error: {str(e)}")
                                    st.info("Please check if STRIPE_API_KEY is set in .env")

                            # Show Payment Link if generated
                            if f"pay_link_{idx}" in st.session_state:
                                # Check for Test Mode
                                is_test = os.getenv("STRIPE_API_KEY", "").startswith("sk_test_")
                                btn_label = "💳 点击前往支付 (Stripe - 沙盒测试)" if is_test else "💳 点击前往支付 (Stripe)"
                                
                                st.link_button(
                                    btn_label, 
                                    st.session_state[f"pay_link_{idx}"], 
                                    use_container_width=True
                                )
                                if is_test:
                                    st.caption("⚠️ 当前为沙盒模式，不会产生实际扣款")
                        
                        # Cost Calculation Logic
                        if nums: total_cost += int(nums[0])
                        if transport:
                            t_nums = re.findall(r'\d+', transport.get("cost", ""))
                            if t_nums: total_cost += int(t_nums[0])
                
                st.markdown("---")
                st.metric("💰 预计总花费", f"SGD ${total_cost}")
                st.caption("*包含门票预估费用")
                
                # SAVE TO COMMUNITY BUTTON
                if st.session_state.user:
                    if st.button("💾 保存并分享到社区 (Save to Community)", use_container_width=True):
                        database.save_plan(
                            st.session_state.user[0], 
                            st.session_state.user[1], 
                            st.session_state.mood, 
                            st.session_state.start_loc_name, 
                            st.session_state.route,
                            st.session_state.route_summary
                        )
                        st.toast("✅ 行程已保存到社区！")
                        time.sleep(1)
                else:
                    st.info("📝 登录后即可保存您的行程分享给他人")
                
            else:
                st.info("👈 请在左侧生成您的行程")

    # --- Tab 2: Community Feed ---
    with tab_comm:
        st.subheader("🌍 社区灵感 (Community Plans)")
        plans = database.get_all_plans()
        
        if not plans:
            st.info("暂无分享，快来成为第一个分享者吧！")
        
        for p in plans:
            with st.container(border=True):
                # Header: User & Mood
                c_user, c_mood, c_date = st.columns([2, 2, 2])
                with c_user:
                    st.markdown(f"**👤 {p['username']}**")
                with c_mood:
                    st.markdown(f"🎭 {p['mood']}")
                with c_date:
                    st.caption(f"📅 {p['created_at']}")
                
                st.markdown(f"**🚩 出发地:** {p['start_loc']}")
                
                # Summary if available
                if p.get("summary"):
                    st.caption(f"✨ {p['summary']}")
                
                # Review Display
                if p.get("review_text"):
                    st.markdown("---")
                    st.markdown("#### 📝 旅后感 (Post-Trip Review)")
                    
                    # Rating
                    stars = "⭐" * (p['rating'] or 0)
                    st.markdown(f"**评分:** {stars}")
                    
                    # Mood Change
                    if p.get("post_mood"):
                        st.write(f"🎭 **心情变化:** {p['mood']} ➡️ **{p['post_mood']}**")
                    
                    # Comment
                    st.info(f"🗣️ \"{p['review_text']}\"")
                    st.markdown("---")

                # Route Summary
                route = p['route']
                stops = [stop['name'] for stop in route]
                st.markdown(f"**📍 路线 ({len(stops)} stops):**")
                
                # Horizontal Steps (Styled to avoid black background)
                steps_html = " <span style='color:#ccc'>→</span> ".join(stops)
                st.markdown(f"""
                <div style="
                    background-color: #f0f2f6; 
                    padding: 10px; 
                    border-radius: 8px; 
                    color: #4a69bd; 
                    font-weight: 600; 
                    font-size: 0.9rem;
                    border: 1px solid #d1d5db;
                ">
                    {steps_html}
                </div>
                """, unsafe_allow_html=True)
                
                # Load Button (Optional - could load into main view)
                c_load, c_meetup, c_review = st.columns([1, 1, 1])
                with c_load:
                    if st.button("👀 查看详情 (Load this Plan)", key=f"load_{p['id']}"):
                        st.session_state.route = route
                        st.session_state.mood = p['mood']
                        st.session_state.start_loc_name = p['start_loc']
                        st.session_state.route_summary = p.get("summary", "")
                        st.toast(f"已加载 {p['username']} 的行程！请切换到'行程规划'标签页查看地图。")
                
                with c_meetup:
                    if st.session_state.user:
                        with st.popover("📅 发起同游 (Schedule Meetup)"):
                            st.write("设置出发时间，邀请其他人加入！")
                            meetup_time = st.text_input("出发时间 (e.g. 明天上午10点)", key=f"time_{p['id']}")
                            if st.button("确认发起", key=f"confirm_{p['id']}"):
                                if meetup_time:
                                    database.create_meetup(p['id'], st.session_state.user[0], st.session_state.user[1], meetup_time)
                                    st.success("发起成功！请前往 '结伴同游' 标签页查看。")
                                else:
                                    st.error("请输入时间")
                    else:
                        st.caption("登录后可发起同游")
                
                with c_review:
                    # Allow owner to add/edit review
                    if st.session_state.user and st.session_state.user[1] == p['username']:
                        with st.popover("📝 写评价 (Review)"):
                            st.write("旅程结束了吗？分享你的感受！")
                            new_post_mood = st.select_slider("🎭 旅后心情 (Post-Trip Mood)", 
                                                           options=["Chill (休闲)", "Energetic (活力)", "Foodie (美食)", "Melancholy (忧郁)", "Cultural (文化)", "Happy (开心)", "Tired (累但充实)"],
                                                           key=f"pm_{p['id']}")
                            new_rating = st.slider("⭐ 评分 (Rating)", 1, 5, 5, key=f"rt_{p['id']}")
                            new_comment = st.text_area("✍️ 评价 (Comments)", key=f"cm_{p['id']}")
                            
                            if st.button("提交评价", key=f"sub_rev_{p['id']}"):
                                database.add_review(p['id'], new_post_mood, new_comment, new_rating)
                                st.success("评价已保存！")
                                time.sleep(1)
                                st.rerun()

    # --- Tab 3: Meetups ---
    with tab_meetup:
        st.subheader("🤝 结伴同游 (Join a Walking Group)")
        meetups = database.get_all_meetups()
        
        if not meetups:
            st.info("暂无同游计划，去 '社区分享' 发起一个吧！")
        
        for m in meetups:
            with st.container(border=True):
                c_info, c_action = st.columns([3, 1])
                
                with c_info:
                    st.markdown(f"#### 🚩 {m['host_name']} 发起的漫步")
                    st.caption(f"🕒 时间: **{m['meetup_time']}**")
                    st.write(f"📍 路线: {m['start_loc']} ({m['mood']})")
                    if m.get("summary"):
                        st.info(f"✨ {m['summary']}")
                    
                    # Participants
                    parts = m['participants']
                    st.write(f"👥 已加入 ({len(parts)}人): {', '.join(parts)}")
                
                with c_action:
                    if st.session_state.user:
                        username = st.session_state.user[1]
                        if username in m['participants']:
                            st.success("✅ 已加入")
                        else:
                            if st.button("👋 加入 (Join)", key=f"join_{m['id']}"):
                                database.join_meetup(m['id'], username)
                                st.rerun()
                    else:
                        st.caption("登录后加入")

if __name__ == "__main__":
    main()