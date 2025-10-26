# CCS Alumni Chatbot - Visual Reference

## Interface Overview

### Chatbot Toggle Button
```
┌─────────────────────────┐
│                         │
│     [Bottom Right]      │
│                         │
│         💬 (60x60)     │ ← Floating button
│      (Maroon/Red)       │   with notification badge
└─────────────────────────┘
```

### Main Chatbot Window
```
┌─────────────────────────────────────┐
│  🤖 Ask CeeVee              [×]     │ ← Blue header (#0066cc)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐  │ Bot message (blue bubble)
│  │ Hi. My name is CeeVee!      │  │
│  │ I'm the Centre for Computer │  │
│  │ Studies (CCS)'s friendly    │  │
│  │ virtual assistant...        │  │
│  └─────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐  │ Button options
│  │  I'm a student              │  │
│  ├─────────────────────────────┤  │
│  │  I'm an alumnus/alumna      │  │
│  ├─────────────────────────────┤  │
│  │  I'm an employer            │  │
│  ├─────────────────────────────┤  │
│  │  I'm a staff                │  │
│  └─────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│     Type a Message                  │ ← Footer (decorative)
└─────────────────────────────────────┘
```

### User Interaction Flow
```
┌─────────────────────────────────────┐
│  🤖 Ask CeeVee              [×]     │
├─────────────────────────────────────┤
│  [Bot message in blue]              │
│  Hi. My name is CeeVee! ...         │
│                                     │
│           [User clicked]            │
│     I'm an alumnus/alumna     ◄──  │ User selection (gray)
│                                     │
│  [Bot response in blue]             │
│  Welcome, alumnus/alumna!           │
│  How can I assist you today?        │
│                                     │
│  ┌─────────────────────────────┐  │
│  │  Update My Profile          │  │
│  ├─────────────────────────────┤  │
│  │  Connect with Batchmates    │  │
│  ├─────────────────────────────┤  │
│  │  Job Opportunities          │  │
│  ├─────────────────────────────┤  │
│  │  Upcoming Events            │  │
│  ├─────────────────────────────┤  │
│  │  Go back                    │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Header Background**: `#0066cc` (Professional Blue)
- **Bot Message Bubble**: `#0066cc` (Blue)
- **User Message Bubble**: `#e5e5ea` (Light Gray)
- **Background**: `#f5f7fa` (Light Gray/Blue)

### Button Colors
- **Default**: White background, blue border (#0066cc)
- **Hover**: Blue background (#0066cc), white text
- **Shadow**: `rgba(0, 102, 204, 0.3)`

### Text Colors
- **Header Text**: White
- **Bot Message Text**: White
- **User Message Text**: Black
- **Footer Text**: `#999` (Gray)

## Typography

### Font Sizes
- **Header Title**: `1.1rem` (bold)
- **Message Text**: `0.95rem`
- **Button Text**: `0.9rem`
- **Footer Text**: `0.85rem`
- **Robot Icon**: `1.5rem`

### Font Weights
- **Header**: `700` (Bold)
- **Buttons**: `500` (Medium)
- **Regular Text**: `400` (Normal)

## Dimensions

### Desktop
- **Width**: `400px`
- **Height**: `600px`
- **Border Radius**: `12px`
- **Position**: Fixed, bottom-right
- **Offset**: `20px` from right, `90px` from bottom

### Mobile (< 768px)
- **Width**: `100vw` (Full screen)
- **Height**: `100vh` (Full screen)
- **Border Radius**: `0` (No rounded corners)
- **Position**: Fixed, full overlay

## Button Styling

### Option Buttons
```css
background: white
border: 2px solid #0066cc
border-radius: 20px
padding: 10px 20px
font-size: 0.9rem
font-weight: 500
color: #0066cc
```

### Hover State
```css
background: #0066cc
color: white
transform: translateX(4px)
box-shadow: 0 3px 8px rgba(0, 102, 204, 0.3)
```

## Message Bubble Styling

### Bot Message
```css
background: #0066cc
color: white
border-radius: 18px
border-bottom-left-radius: 4px
padding: 14px 18px
max-width: 85%
align-self: flex-start
```

### User Message
```css
background: #e5e5ea
color: #000
border-radius: 18px
border-bottom-right-radius: 4px
padding: 14px 18px
max-width: 85%
align-self: flex-end
```

## Animation Effects

### Fade In (Messages)
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Button Hover
```css
transition: all 0.2s ease
transform: translateX(4px) on hover
```

### Badge Pulse
```css
@keyframes pulseBadge {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

## Component Hierarchy

```
Chatbot Container
├── Toggle Button (Fixed)
│   └── Notification Badge (Conditional)
└── Chatbot Window (Conditional on isOpen)
    ├── Header
    │   ├── Robot Icon
    │   ├── Title "Ask CeeVee"
    │   └── Close Button
    ├── Messages Area (Scrollable)
    │   └── Message Bubbles
    │       ├── Message Text
    │       └── Option Buttons (Conditional)
    └── Footer
        └── "Type a Message" Text
```

## Responsive Breakpoints

### Desktop (> 768px)
- Floating window in bottom-right
- 400px × 600px
- Rounded corners
- Shadow effect

### Mobile (≤ 768px)
- Full screen overlay
- 100vw × 100vh
- No rounded corners
- Fills entire viewport

## User Flow Visualization

```
START
  │
  ├─→ [Open Chatbot]
  │      │
  │      ├─→ Welcome Message
  │      │      │
  │      │      ├─→ Select: I'm a student
  │      │      │      │
  │      │      │      ├─→ System Navigation
  │      │      │      ├─→ System Features
  │      │      │      ├─→ Alumni Career Insights
  │      │      │      └─→ Go back → [Welcome]
  │      │      │
  │      │      ├─→ Select: I'm an alumnus/alumna
  │      │      │      │
  │      │      │      ├─→ Update My Profile
  │      │      │      ├─→ Connect with Batchmates
  │      │      │      ├─→ Job Opportunities
  │      │      │      ├─→ Upcoming Events
  │      │      │      └─→ Go back → [Welcome]
  │      │      │
  │      │      ├─→ Select: I'm an employer
  │      │      │      │
  │      │      │      ├─→ How to Post Jobs
  │      │      │      ├─→ Find CCS Graduates
  │      │      │      ├─→ Contact Admin
  │      │      │      └─→ Go back → [Welcome]
  │      │      │
  │      │      └─→ Select: I'm a staff
  │      │             │
  │      │             ├─→ Admin Features
  │      │             ├─→ Generate Reports
  │      │             ├─→ User Management
  │      │             └─→ Go back → [Welcome]
  │      │
  │      └─→ [Close Chatbot]
  │
END
```

## Icon Usage

### Toggle Button
- Icon: `FaComments` (💬)
- Color: White
- Size: `1.5rem`

### Header
- Icon: `FaRobot` (🤖)
- Color: White
- Size: `1.5rem`

### Close Button
- Icon: `FaTimes` (×)
- Color: White
- Size: `1.2rem`

### Message Emojis (In Text)
- 🗺️ System Navigation
- ✨ Features
- 📈 Alumni Insights
- 👤 Profile
- 🤝 Networking
- 💼 Jobs
- 📅 Events
- 🔧 Admin Features
- 📊 Reports
- 👥 User Management
- 📝 Post Jobs
- 🎯 Find Talent
- 📧 Contact

## Accessibility Features

### Keyboard Navigation
- Tab through buttons
- Enter to select
- Escape to close (potential addition)

### Screen Reader Support
- ARIA labels on buttons
- Semantic HTML structure
- Alt text for icons

### Color Contrast
- WCAG AA compliant
- High contrast between text and background
- Clear button states

## State Management

### React States
```javascript
conversationState: 'welcome' | 'student' | 'alumni' | 'employer' | 'staff'
messages: Array<Message>
unreadCount: number
isOpen: boolean (from parent)
```

### Message Structure
```javascript
{
  id: number,
  text: string,
  sender: 'bot' | 'user',
  timestamp: Date,
  options?: Array<Option>
}
```

### Option Structure
```javascript
{
  id: string,
  label: string
}
```

## Performance Considerations

- Instant responses (no API calls)
- Smooth scroll animations
- Efficient re-renders with React.memo potential
- Lazy loading not needed (small component)
- No external dependencies (icons from react-icons)

---

**Design Inspiration**: NUS CFG (Centre for Future-ready Graduates) Chatbot  
**Design System**: Modern, clean, professional  
**Primary Color Philosophy**: Trust and professionalism (Blue)  
**Interaction Pattern**: Guided conversation, button-based  
**Accessibility**: WCAG AA compliant
