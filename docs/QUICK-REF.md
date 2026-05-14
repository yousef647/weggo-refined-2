# Quick Reference Card

Print this or keep it handy!

---

## 👥 TEAM AT A GLANCE

```
┌─────────────────────────────────────────────────────────────┐
│ YOUSSEF AMR (You)                                           │
│ Skill: ⭐⭐⭐⭐⭐ (Expert)                                   │
│ Role: Full Stack Lead & Architect                           │
│ Tasks: Payment, Real-time, Performance, Database            │
│ Timeline: 3-4 weeks                                         │
│ Blockers: Stripe account setup                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AMR ADEL                                                     │
│ Skill: ⭐⭐⭐⭐ (Very Skilled)                              │
│ Role: Senior API Developer                                  │
│ Tasks: Email, Orders, Reviews, Analytics                    │
│ Timeline: 3-4 weeks                                         │
│ Blockers: None (ready to go)                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ YOUSSEF KHALED & MARAWAN KHALED (PAIR)                      │
│ Skill: ⭐⭐ (Beginner)                                      │
│ Role: Admin Panel Development                               │
│ Tasks: Admin UI, Dashboard, Reports, Management             │
│ Timeline: 3-4 weeks                                         │
│ Blockers: Learning curve (expected)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 WHAT NEEDS TO BE BUILT

### CRITICAL (DO FIRST - Week 1-2)
- [ ] Payment Processing (Stripe)
- [ ] Real-time Messaging (WebSocket)
- [ ] Email Notifications
- [ ] Order Management
- [ ] Ratings & Reviews
- [ ] Admin Dashboard
- [ ] Admin Reports

### HIGH (Week 3)
- [ ] Database Optimization
- [ ] Redis Caching
- [ ] Advanced Profiles
- [ ] User Analytics
- [ ] Reporting System
- [ ] Category Management
- [ ] User Management

### MEDIUM (Week 4+)
- [ ] Recommendations
- [ ] Image Optimization
- [ ] Advanced Search
- [ ] Saved Searches
- [ ] Performance Tuning

---

## 🚀 GETTING STARTED

### Step 1: Set Up Local Environment
```bash
npm install
cp .env.example .env
npm run seed:categories
npm run seed:admin
npm run dev
```

### Step 2: Understand Current Code
- Read: `docs/ARCHITECTURE.md` (30 min)
- Read: `docs/CODEBASE.md` (30 min)
- Explore: Current implementation (30 min)

### Step 3: Start Building
- Pick your first task from `docs/TASKS.md`
- Create a branch
- Build & test
- Push for code review

---

## 📞 WHO TO ASK

| Question | Ask |
|----------|-----|
| Architecture decision | Youssef Amr |
| API implementation | Amr Adel |
| React/Component help | Either Senior |
| Admin UI question | Pair with partner |
| Code review | Push to GitHub |
| I'm blocked >30 min | Ask immediately |

---

## 💻 COMMON COMMANDS

```bash
# Development
npm run dev              # Start dev server
npm run lint             # Check code quality
npm run build            # Build for production

# Database
npm run seed:categories  # Seed categories
npm run seed:admin       # Seed admin account
npm run seed:listings    # Seed demo listings

# Git
git checkout -b feature/name    # Create branch
git commit -m "message"         # Commit work
git push origin feature/name    # Push to GitHub

# Testing
curl http://localhost:3000/api/listings
# Or use VS Code REST Client
```

---

## 📅 DAILY ROUTINE

```
10:00 AM → Daily Standup (15 min)
          "What did you do? What's next? Blockers?"

10:15 AM → Start Work
          "Pick task → Code → Test → Commit"

12:00 PM → Lunch

1:00 PM → Continue Work
         "Keep building, ask for help if stuck"

3:00 PM → Check Code Reviews
         "Review others' code, respond to feedback"

5:00 PM → Wrap Up
         "Commit work, document progress"

WED 2:00 PM → Feature Review & Sprint Planning
```

---

## 🎯 THIS WEEK'S GOALS

### Youssef Amr (You):
- [ ] Plan payment architecture
- [ ] Set up Stripe
- [ ] Start payment processing
- [ ] Design real-time system

### Amr Adel:
- [ ] Plan email system
- [ ] Set up email service
- [ ] Start email templates
- [ ] Design order API

### Beginners (Both):
- [ ] Get local env running
- [ ] Read architecture docs
- [ ] Study code patterns
- [ ] Start admin dashboard task

---

## 📊 PROJECT STATUS

**Current:** 60-65% Complete
- ✅ Auth, Listings, Messaging, Wishlist
- ❌ Payment, Orders, Reviews, Real-time

**After Week 1-2:** 85-90% Complete
- ✅ Add: Payment, Orders, Reviews, Real-time, Notifications

**After Week 3-4:** 95%+ Complete
- ✅ Add: Analytics, Optimization, Polish

---

## 🆘 STUCK? DO THIS

1. **Check the docs** (`docs/` folder)
2. **Google the error** (likely common)
3. **Look at similar code** in codebase
4. **Ask in chat** (#weggo-dev)
5. **Pair program** with a teammate
6. **Escalate** if blocked >30 min

Remember: Asking for help is smart! ✅

---

## 📚 KEY DOCUMENTS

| Document | Read First |
|----------|-----------|
| `SETUP.md` | Getting started |
| `ARCHITECTURE.md` | Understand structure |
| `CODEBASE.md` | Learn patterns |
| `TASKS.md` | See what to build |
| `TEAM.md` | Your role |
| `STATUS.md` | Project status |

---

## ⚡ QUICK DECISIONS

**"Should I start coding?"**
- Have you read ARCHITECTURE.md? → Yes? → Start
- No? → Read it first (30 min)

**"Is this task urgent?"**
- Is it in TASKS.md CRITICAL section? → Yes? → Do now
- No? → Check with Youssef Amr

**"How do I style a component?"**
- Use Tailwind CSS (see DEVELOPMENT.md examples)
- Never write plain CSS

**"What git branch should I use?"**
- `feature/feature-name` for new features
- `fix/bug-name` for bug fixes

**"When should I ask for help?"**
- After trying for 15-20 minutes
- When blocked by decision/architecture
- When unsure about implementation

---

## ✅ DEFINITION OF DONE

Before marking a task done:
- [ ] Code written & tested
- [ ] No console errors/warnings
- [ ] Mobile responsive (if UI)
- [ ] Error handling implemented
- [ ] Code pushed to GitHub
- [ ] Code review requested
- [ ] Code review approved
- [ ] Merged to main branch

---

## 🎉 YOU GOT THIS!

**Remember:**
- You're not alone (4-person team)
- Ask for help early
- No stupid questions
- Small progress = victory
- Document everything
- Have fun! 🚀

**Let's build something amazing!**

---

**Questions? Start with docs → Ask team → Escalate if needed**

*Last updated: [Today's Date]*
*Next review: [End of Week 1]*
