# CCS Alumni Chatbot Guide

## Overview
The CCS Alumni chatbot has been redesigned to follow the NUS CFG (Centre for Future-ready Graduates) model, featuring guided conversations instead of free-form AI chat. The chatbot is named **Jaguar** (the CCS mascot) and uses the system's pink theme (#e91e63) for a cohesive brand experience. This approach ensures more accurate, privacy-conscious, and user-friendly interactions.

## Key Features

### 1. **Guided Conversation Flow**
- Button-based interactions (no free-text input)
- Predefined conversation paths
- Clear, structured responses
- Easy navigation with "Go back" options

### 2. **User Type Selection**
When users open the chatbot, they first identify themselves:
- **Student**: Access system navigation, features, and alumni career insights
- **Alumni**: Get help with profile updates, networking, job opportunities, and events
- **Employer**: Learn about posting jobs and finding CCS graduates
- **Staff**: Access admin features, reports, and user management help

### 3. **Privacy Protection**
Built-in safeguards to protect user data:
- No personal information disclosure about other users
- Aggregated data only (employment statistics, not individual salaries)
- Privacy reminders in networking features
- Restricted access to sensitive information

### 4. **Context-Aware Navigation Assistance**
The chatbot helps users:
- Navigate the system efficiently
- Understand available features
- Find specific pages and functions
- Learn about system capabilities

## User Flows

### Student Flow
```
Welcome → I'm a student
  ├─ System Navigation → Explains menu structure
  ├─ System Features → Lists all available features
  ├─ Alumni Career Insights → General career outcome data
  └─ Go back → Return to user type selection
```

### Alumni Flow
```
Welcome → I'm an alumnus/alumna
  ├─ Update My Profile → Step-by-step guide
  ├─ Connect with Batchmates → Networking instructions
  ├─ Job Opportunities → Job board navigation
  ├─ Upcoming Events → Event information
  └─ Go back → Return to user type selection
```

### Employer Flow
```
Welcome → I'm an employer
  ├─ How to Post Jobs → Job posting process
  ├─ Find CCS Graduates → Recruitment assistance (privacy-protected)
  ├─ Contact Admin → Admin contact information
  └─ Go back → Return to user type selection
```

### Staff Flow
```
Welcome → I'm a staff
  ├─ Admin Features → List of admin capabilities
  ├─ Generate Reports → Reporting tools guide
  ├─ User Management → User management instructions
  └─ Go back → Return to user type selection
```

## Technical Implementation

### Architecture
- **No Ollama dependency**: Removed AI model requirements
- **State-based conversations**: Uses React state management
- **Predefined responses**: All content is hardcoded for accuracy
- **Button interactions only**: No text input field

### Key Components

#### Chatbot.js
```javascript
// Main state variables
- conversationState: Tracks current position in conversation flow
- userType: Stores selected user type (student/alumni/employer/staff)
- messages: Array of conversation messages with options
- unreadCount: Notification badge counter
```

#### Chatbot.css
- Clean, modern styling inspired by NUS CFG
- Blue color scheme (#0066cc)
- Rounded message bubbles
- Hover effects on buttons
- Responsive design for mobile

### Data Privacy Implementation

```javascript
const isPrivacyViolation = (query) => {
  const privacyKeywords = [
    'password', 'email of', 'phone number of', 'address of',
    'personal data', 'other user', 'salary of', 'contact info'
  ];
  return privacyKeywords.some(keyword => 
    query.toLowerCase().includes(keyword)
  );
};
```

## Content Guidelines

### Response Structure
Each response includes:
1. **Clear heading** with emoji for visual appeal
2. **Bullet points** for easy scanning
3. **Action items** when applicable
4. **Privacy notices** where relevant
5. **Follow-up options** as buttons

### Example Response
```
💼 **Job Opportunities:**

Access the **Job Board** to:
• Browse current job openings
• Filter by industry, location, or job type
• Save jobs to your favorites
• Apply directly through the system

New opportunities are posted regularly by employers and the CCS admin team.
```

## Customization Guide

### Adding New User Types
1. Add option to `conversationFlows.welcome.options`
2. Create new flow in `conversationFlows` object
3. Add corresponding responses in `getTopicResponse`

### Adding New Topics
1. Add button to appropriate user type flow
2. Create response object in `getTopicResponse`
3. Include relevant options for navigation

### Modifying Responses
Edit the `responses` object in `getTopicResponse` function:
```javascript
topic_id: {
  text: "Your message with **markdown** support",
  options: [
    { id: 'next_topic', label: 'Button Text' },
    { id: 'go_back', label: 'Go back' }
  ]
}
```

## Benefits Over AI-Based Chatbot

### 1. **Accuracy**
- No hallucinations or incorrect information
- Consistent responses every time
- Admin-controlled content

### 2. **Privacy**
- No risk of AI exposing sensitive data
- Controlled data access
- Clear privacy boundaries

### 3. **Performance**
- No external API calls
- Instant responses
- No Ollama setup required
- Lower resource usage

### 4. **Maintenance**
- Easy to update content
- No model training needed
- Simple debugging
- Predictable behavior

### 5. **User Experience**
- Clear conversation paths
- No confusion about capabilities
- Visual button interface
- Guided navigation

## Mobile Responsiveness
- Full-screen on mobile devices
- Touch-optimized buttons
- Readable text sizes
- Proper spacing for touch targets

## Future Enhancements

### Potential Additions
1. **Search functionality**: Quick topic search
2. **Bookmarking**: Save helpful responses
3. **Multi-language support**: Tagalog/English toggle
4. **Voice interface**: Text-to-speech for accessibility
5. **Analytics**: Track common user questions
6. **FAQ integration**: Link to detailed documentation
7. **Video tutorials**: Embedded help videos

### Integration Opportunities
1. **Direct navigation**: Buttons that navigate to actual pages
2. **Form pre-filling**: Auto-fill forms with chatbot data
3. **Event RSVP**: In-chat event registration
4. **Job applications**: Quick-apply through chatbot

## Testing Checklist

- [ ] All user type selections work
- [ ] All topic buttons function correctly
- [ ] "Go back" returns to previous state
- [ ] Privacy protections are in place
- [ ] Mobile layout is responsive
- [ ] Unread badge displays correctly
- [ ] Messages scroll properly
- [ ] Animations work smoothly
- [ ] No console errors
- [ ] Accessible keyboard navigation

## Maintenance Schedule

### Weekly
- Review user feedback
- Check for broken flows
- Update event information

### Monthly
- Update job posting instructions
- Refresh alumni statistics
- Review and update contact information

### Quarterly
- Comprehensive content review
- Add new features/topics
- Update styling if needed

## Support & Troubleshooting

### Common Issues

**Issue**: Chatbot doesn't open
- Check authentication state
- Verify component is mounted
- Check console for errors

**Issue**: Buttons not clickable
- Inspect CSS z-index conflicts
- Check for overlay elements
- Verify event handlers

**Issue**: Messages not displaying
- Check state initialization
- Verify message format
- Review conversation flow logic

## Contact Information
For chatbot updates or issues:
- **Admin Email**: admin@ccs.edu
- **Technical Support**: support@ccs.edu

---

**Last Updated**: January 2025
**Version**: 2.0 (Guided Conversation Model)
