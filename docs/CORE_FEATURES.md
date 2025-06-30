# Core Features

This document details the core features of the Musician Growth App.

## MVP Scope: What is included in the initial release

The Minimum Viable Product (MVP) is focused on validating the core idea: providing valuable, automated advice to musicians. Anything not listed here is considered a future enhancement.

**The MVP includes:**
1.  **A single-page web application.**
2.  **Musician Information Input Form:** A form to collect the user's current status.
3.  **Rule-Based Recommendation Engine:** A client-side engine that generates advice based on the form input.
4.  **Display of Recommendations:** A clean and clear presentation of the generated advice.

**The MVP specifically EXCLUDES:**
*   User accounts or logins.
*   Data storage of any kind.
*   A backend server.
*   A content library or blog.
*   Any payment or subscription features.

---

This document details the core features of the Musician Growth App for its Minimum Viable Product (MVP) release.

## 1. Musician Information Input Form

This is the primary user interaction point. The form will be designed to be intuitive and quick to complete, encouraging users to engage.

*   **Component:** `MusicianForm.tsx`
*   **Objective:** To gather the necessary data points to generate meaningful recommendations.

### Input Fields:

1.  **Primary Instrument:**
    *   **Type:** Dropdown menu with a search/filter feature.
    *   **Options:** A pre-populated list of common instruments (e.g., Guitar, Piano, Vocals, Drums, Violin, Saxophone) with an "Other" option that reveals a text input field.
    *   **Rationale:** Structured data is easier to analyze than free-form text.

2.  **Performance Frequency:**
    *   **Type:** A set of radio buttons or a slider.
    *   **Options:**
        *   Never / Just Practice
        *   A few times a year
        *   Monthly
        *   Weekly
        *   Multiple times a week
    *   **Rationale:** Provides a clear measure of the musician's current live performance activity.

3.  **Average Crowd Size:**
    *   **Type:** Slider with clearly marked ranges.
    *   **Options:** 1-10, 10-50, 50-100, 100-500, 500+
    *   **Rationale:** Crowd size is a key indicator of a musician's current reach and drawing power.

4.  **Years of Experience:**
    *   **Type:** Number input or a slider.
    *   **Range:** 0-50+ years.
    *   **Rationale:** Helps distinguish between a novice musician and a seasoned veteran, which heavily influences the type of advice given.

5.  **Current Marketing Efforts:**
    *   **Type:** A checklist of common marketing activities.
    *   **Options:**
        *   Social Media (Facebook, Instagram, TikTok)
        *   Mailing List
        *   Website/Blog
        *   Posters/Fliers
        *   Networking with other musicians
        *   None of the above
    *   **Rationale:** Understanding what a musician is *already* doing is crucial to avoid redundant advice and identify gaps in their strategy.

## 2. Recommendation Generation Engine

This is the core logic of the application. It processes the user's input and provides tailored, actionable advice.

*   **Module:** `recommendationEngine.ts`
*   **Objective:** To provide value to the user by offering concrete, relevant, and easy-to-understand recommendations.

### How It Works:

The engine will use a rule-based system. Each rule will check for a specific combination of inputs and, if matched, will add a specific `Recommendation` object to the results.

### Recommendation Categories:

The advice will be grouped into several key areas of musician growth:

1.  **Marketing & Promotion:**
    *   **Trigger:** Low crowd size, minimal marketing efforts.
    *   **Example Advice:** "Focus on building a social media presence. Start by posting one high-quality video of you playing each week on Instagram and TikTok. Use relevant hashtags like #livemusic and #[yourcity]music."

2.  **Performance & Gigging:**
    *   **Trigger:** High experience level but low performance frequency.
    *   **Example Advice:** "You have the skills, now it's time to get on stage. Reach out to 3 local venues this week that host open mic nights. It's a great way to network and get comfortable performing regularly."

3.  **Networking & Collaboration:**
    *   **Trigger:** Solo artist, low crowd size.
    *   **Example Advice:** "Connect with other musicians in your area. Attend local jam sessions or reach out to another artist on social media for a potential collaboration. Combining audiences is a powerful growth strategy."

4.  **Skill Development:**
    *   **Trigger:** Low years of experience.
    *   **Example Advice:** "Consistency is key. Dedicate at least 30 minutes every day to focused practice. Consider finding a mentor or online course to accelerate your learning in a specific area, like music theory or improvisation."

### Output:

The engine will output an array of 3-5 targeted recommendations, each with:
*   A clear, engaging title (e.g., "Supercharge Your Social Media").
*   A concise, actionable description of what to do next.