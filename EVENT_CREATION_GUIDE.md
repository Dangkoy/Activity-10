# Event Creation Guide

## Required Fields (*)

When creating an event, you must fill in these fields:

### 1. **Event Title** *
- **What it is:** The name of your event
- **Example:** 
  - "Tech Innovation Summit 2024"
  - "Annual Company Conference"
  - "Web Development Workshop"
  - "Music Festival - Summer Edition"
  - "Networking Mixer for Entrepreneurs"

### 2. **Description** *
- **What it is:** Detailed information about your event
- **Should include:**
  - What the event is about
  - Agenda or schedule
  - Speakers/presenters (if applicable)
  - What attendees will learn/gain
  - Dress code or special instructions (if any)
- **Example:**
  ```
  Join us for an exciting day of learning and networking! 
  This conference brings together industry leaders to discuss 
  the latest trends in technology and innovation.
  
  Agenda:
  - 9:00 AM: Registration & Welcome
  - 10:00 AM: Keynote: "Future of Tech"
  - 11:30 AM: Panel Discussion
  - 1:00 PM: Lunch Break
  - 2:00 PM: Workshops
  - 5:00 PM: Networking Session
  
  Speakers include industry experts from top companies.
  Lunch and refreshments will be provided.
  ```

### 3. **Location** *
- **What it is:** Where the event will take place
- **Format:** Full address or venue name
- **Examples:**
  - "Convention Center, 123 Main Street, New York, NY 10001"
  - "Grand Hotel Ballroom, 456 Park Avenue, Los Angeles, CA 90001"
  - "Virtual Event (Zoom link will be sent after registration)"
  - "Central Park, New York, NY"
  - "Online Webinar (Link will be provided)"

### 4. **Start Date & Time** *
- **What it is:** When the event begins
- **Format:** Date and time (datetime-local)
- **Examples:**
  - "2024-03-15T09:00" (March 15, 2024 at 9:00 AM)
  - "2024-06-20T14:30" (June 20, 2024 at 2:30 PM)
- **Important:** 
  - Must be in the future
  - Must be before End Date

### 5. **End Date & Time** *
- **What it is:** When the event ends
- **Format:** Date and time (datetime-local)
- **Examples:**
  - "2024-03-15T17:00" (March 15, 2024 at 5:00 PM)
  - "2024-06-20T18:00" (June 20, 2024 at 6:00 PM)
- **Important:** 
  - Must be after Start Date
  - Can be on the same day or different day

### 6. **Maximum Capacity** *
- **What it is:** Maximum number of attendees allowed
- **Format:** Number (minimum: 1, maximum: 10,000)
- **Examples:**
  - Small workshop: 50
  - Conference: 500
  - Large event: 1000
  - Festival: 5000
- **Tip:** Consider venue size and logistics when setting capacity

---

## Optional Fields

### 7. **Image URL** (Optional)
- **What it is:** A link to an image representing your event
- **Format:** Full URL (must be a valid image URL)
- **Examples:**
  - `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800`
  - `https://example.com/event-banner.jpg`
  - `https://via.placeholder.com/800x400?text=Event+Banner`
- **Best Practices:**
  - Use high-quality images (800x400px or larger recommended)
  - Images should represent your event theme
  - Use reliable image hosting (Unsplash, Imgur, etc.)
  - Make sure the URL is publicly accessible

---

## Complete Event Example

Here's a complete example of a well-formatted event:

### Example 1: Technology Conference

```
Title: Tech Innovation Summit 2024
Description: Join industry leaders for a full-day technology conference covering AI, cloud computing, and cybersecurity. Features keynote speakers from major tech companies, hands-on workshops, and networking opportunities. Breakfast and lunch included.

Location: San Francisco Convention Center, 747 Howard St, San Francisco, CA 94103

Start Date & Time: 2024-04-20T08:00
End Date & Time: 2024-04-20T18:00

Capacity: 500

Image URL: https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800
```

### Example 2: Workshop

```
Title: Python Programming Workshop for Beginners
Description: Learn Python from scratch in this interactive 4-hour workshop. No prior experience required! We'll cover basics, data types, functions, and create your first project. Bring your laptop. Coffee and snacks provided.

Location: Tech Hub Co-working Space, 123 Innovation Drive, Austin, TX 78701

Start Date & Time: 2024-03-10T13:00
End Date & Time: 2024-03-10T17:00

Capacity: 30

Image URL: https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800
```

### Example 3: Networking Event

```
Title: Entrepreneurs Networking Mixer
Description: Monthly networking event for entrepreneurs, startups, and business professionals. Mix and mingle, share ideas, and build valuable connections. Light refreshments and appetizers served. Business casual attire.

Location: The Rooftop Bar, 456 Business Avenue, New York, NY 10001

Start Date & Time: 2024-05-05T18:00
End Date & Time: 2024-05-05T21:00

Capacity: 100

Image URL: https://images.unsplash.com/photo-1511578314322-379afb476865?w=800
```

### Example 4: Multi-Day Event

```
Title: Annual Developer Conference 2024
Description: Three-day conference for software developers featuring talks on modern web development, mobile apps, DevOps, and more. Includes code labs, hackathon, and evening social events. Full schedule available on website.

Location: Downtown Conference Center, 789 Tech Street, Seattle, WA 98101

Start Date & Time: 2024-06-15T09:00
End Date & Time: 2024-06-17T17:00

Capacity: 1000

Image URL: https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800
```

---

## Quick Start Templates

### Template 1: Small Workshop (30-50 people)
```
Title: [Workshop Name]
Description: [What participants will learn] Workshop includes hands-on activities and materials. Refreshments provided.
Location: [Venue Name], [Address]
Start: [Date]T13:00
End: [Date]T17:00
Capacity: 40
```

### Template 2: Conference (200-500 people)
```
Title: [Conference Name] 2024
Description: [Theme/Topic] Join industry experts for talks, panels, and networking. Full agenda with breakfast, lunch, and breaks included.
Location: [Convention Center/Hotel], [Full Address]
Start: [Date]T08:00
End: [Date]T18:00
Capacity: 300
```

### Template 3: Networking Event (50-150 people)
```
Title: [Industry] Networking Mixer
Description: Monthly networking event for [target audience]. Mix and mingle over drinks and appetizers. Casual attire.
Location: [Venue], [Address]
Start: [Date]T18:00
End: [Date]T21:00
Capacity: 100
```

---

## Validation Rules

The system will validate your event data:

✅ **Valid:**
- Title is not empty
- Description is not empty
- Location is not empty
- Start date is in the future
- End date is after start date
- Capacity is at least 1 (maximum 10,000)
- Image URL is a valid URL format (if provided)

❌ **Invalid:**
- Start date in the past
- End date before start date
- Capacity less than 1
- Empty required fields
- Invalid image URL format

---

## Tips for Creating Great Events

1. **Clear Title:** Make it descriptive and searchable
2. **Detailed Description:** Include agenda, speakers, what to bring, dress code
3. **Accurate Location:** Provide full address or clear meeting point
4. **Realistic Capacity:** Consider venue size, fire codes, and logistics
5. **Appealing Image:** Use high-quality, relevant images
6. **Future Dates:** Always set dates in the future (system enforces this)
7. **Reasonable Duration:** Most events are 2-8 hours (single day) or multiple days

---

## Common Event Types

1. **Conferences:** Large, multi-day, professional
2. **Workshops:** Small, hands-on, educational
3. **Seminars:** Medium-sized, informational talks
4. **Networking Events:** Social, meet-and-greet
5. **Training Sessions:** Skill-building, certification prep
6. **Webinars:** Online events, virtual attendance
7. **Hackathons:** Multi-day coding competitions
8. **Festivals:** Large-scale public events
9. **Meetups:** Community gatherings, casual
10. **Exhibitions:** Trade shows, product showcases

---

## Date & Time Format

The system uses `datetime-local` format:
- **Format:** `YYYY-MM-DDTHH:MM`
- **Example:** `2024-12-25T14:30` = December 25, 2024 at 2:30 PM
- **24-hour format:** Use 00:00 to 23:59

---

## Image URL Resources

Free image hosting services you can use:
- **Unsplash:** `https://unsplash.com/photos/[photo-id]?w=800`
- **Pexels:** `https://images.pexels.com/photos/[id]/pexels-photo-[id].jpeg?w=800`
- **Via Placeholder:** `https://via.placeholder.com/800x400?text=Event+Name`

**Note:** You can also upload images to:
- Imgur
- Cloudinary
- Your own web server
- Any public image hosting service

---

**Ready to create your event?** Log in to the Organizer app (localhost:3001) and click "Create New Event"!
