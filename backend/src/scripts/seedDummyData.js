// backend/src/scripts/seedDummyData.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function runSeed() {
  console.log('🌱 Starting dummy data seeding for KahaniLand...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Update Existing Admin Users & Insert Fresh Users
  const usersToSeed = [
    {
      name: 'Admin User',
      email: 'admin@kahaniland.com',
      password: hashedPassword,
      phone: '+91 9876543210',
      role: 'admin',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 1,
      created_offset_days: 30
    },
    {
      name: 'Super Admin',
      email: 'superadmin@kahaniland.com',
      password: hashedPassword,
      phone: '+91 9876543211',
      role: 'superadmin',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 2,
      created_offset_days: 45
    },
    {
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      password: hashedPassword,
      phone: '+91 9811122334',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 3, // Logged in today
      created_offset_days: 0 // Created today
    },
    {
      name: 'Diya Patel',
      email: 'diya.patel@example.com',
      password: hashedPassword,
      phone: '+91 9822233445',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 5, // Logged in today
      created_offset_days: 1 // Created 1 day ago
    },
    {
      name: 'Rohan Gupta',
      email: 'rohan.gupta@example.com',
      password: hashedPassword,
      phone: '+91 9833344556',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 12, // Logged in today
      created_offset_days: 2 // Created 2 days ago
    },
    {
      name: 'Ananya Roy',
      email: 'ananya.roy@example.com',
      password: hashedPassword,
      phone: '+91 9844455667',
      role: 'admin',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 6, // Logged in today
      created_offset_days: 3 // Created 3 days ago
    },
    {
      name: 'Kavita Iyer',
      email: 'kavita.iyer@example.com',
      password: hashedPassword,
      phone: '+91 9855566778',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 48, // Logged in 2 days ago (this week)
      created_offset_days: 4
    },
    {
      name: 'Vikram Malhotra',
      email: 'vikram.m@example.com',
      password: hashedPassword,
      phone: '+91 9866677889',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 72, // Logged in 3 days ago (this week)
      created_offset_days: 5
    },
    {
      name: 'Siddharth Verma',
      email: 'siddharth.v@example.com',
      password: hashedPassword,
      phone: '+91 9877788990',
      role: 'user',
      status: 'inactive',
      email_verified: 0,
      last_login_offset_hours: null, // Never logged in
      created_offset_days: 6
    },
    {
      name: 'Meera Nambiar',
      email: 'meera.n@example.com',
      password: hashedPassword,
      phone: '+91 9888899001',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: null, // Never logged in
      created_offset_days: 2
    },
    {
      name: 'Sunita Joshi',
      email: 'sunita.joshi@example.com',
      password: hashedPassword,
      phone: '+91 9899900112',
      role: 'user',
      status: 'inactive',
      email_verified: 0,
      last_login_offset_hours: null, // Never logged in
      created_offset_days: 14
    },
    {
      name: 'Rahul Sen',
      email: 'rahul.sen@example.com',
      password: hashedPassword,
      phone: '+91 9812345678',
      role: 'user',
      status: 'active',
      email_verified: 1,
      last_login_offset_hours: 24, // Logged in yesterday
      created_offset_days: 1
    }
  ];

  for (const user of usersToSeed) {
    const lastLoginSql = user.last_login_offset_hours !== null
      ? `DATE_SUB(NOW(), INTERVAL ${user.last_login_offset_hours} HOUR)`
      : `NULL`;
    
    const createdSql = `DATE_SUB(NOW(), INTERVAL ${user.created_offset_days} DAY)`;

    const query = `
      INSERT INTO users (name, email, password, phone, role, status, email_verified, last_login, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ${lastLoginSql}, ${createdSql})
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        role = VALUES(role),
        status = VALUES(status),
        email_verified = VALUES(email_verified),
        last_login = ${lastLoginSql},
        created_at = IF(email IN ('admin@kahaniland.com', 'superadmin@kahaniland.com'), created_at, ${createdSql})
    `;

    await new Promise((resolve, reject) => {
      db.query(query, [user.name, user.email, user.password, user.phone, user.role, user.status, user.email_verified], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }
  console.log(`✅ Seeded ${usersToSeed.length} users with current dates`);

  // 2. Seed Realistic Contacts Inquiries
  const contactsToSeed = [
    {
      name: 'Ananya Roy',
      email: 'ananya.roy@delhischools.edu',
      phone: '+91 9810123456',
      subject: 'Storytelling Workshop for Grade 1 & 2',
      message: 'Hello KahaniLand Team! We run a primary school in Delhi and would love to organize a virtual interactive storytelling session with your team for our 120 students.',
      status: 'new',
      offset_hours: 2 // 2 hours ago today
    },
    {
      name: 'Kavita Patel',
      email: 'kavita.patel@gmail.com',
      phone: '+91 9820234567',
      subject: 'Suggestion for Bedtime Audio Volume Normalization',
      message: 'My 4-year-old listens to your Bedtime Stories every single night. Could you please check if background music volume could be slightly lowered compared to narrator voice?',
      status: 'pending',
      offset_hours: 5 // 5 hours ago today
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan.mehta@creativekids.org',
      phone: '+91 9830345678',
      subject: 'Story Submission: The Brave Elephant and Little Mouse',
      message: 'I am a children book author and have drafted a moral tale about cooperation between big and small forest animals. Would love to share the illustrated draft for KahaniLand.',
      status: 'read',
      offset_hours: 14 // 14 hours ago (today)
    },
    {
      name: 'Suresh Nair',
      email: 'suresh.nair@keralalearning.com',
      phone: '+91 9840456789',
      subject: 'Licensing KahaniLand Stories for Educational App',
      message: 'We are developing a state-approved supplementary learning tablet application for rural schools and want to discuss partnership opportunities to include KahaniLand stories.',
      status: 'resolved',
      offset_hours: 28 // Yesterday
    },
    {
      name: 'Deepak Verma',
      email: 'deepak.v@gmail.com',
      phone: '+91 9850567890',
      subject: 'Video fullscreen button overlay on iPad Safari',
      message: 'On iPad Safari iOS 17, when clicking full screen on the animated video player, the top bar sometimes remains visible. Other than that, magnificent collection!',
      status: 'pending',
      offset_hours: 36 // Yesterday
    },
    {
      name: 'Meera Joshi',
      email: 'meera.joshi@sunshinepreschool.in',
      phone: '+91 9860678901',
      subject: 'Printable Coloring Pages Request',
      message: 'Our kindergarten teachers love printing characters from your stories for arts and crafts. Do you have high-resolution PDF coloring sheets available?',
      status: 'read',
      offset_hours: 50 // 2 days ago
    },
    {
      name: 'Amitabh Sen',
      email: 'amitabh.sen@kolkatabookfest.in',
      phone: '+91 9870789012',
      subject: 'Invitation: Kolkata Children Literature Festival 2026',
      message: 'We are thrilled to invite KahaniLand founders and creators to give a keynote presentation at the upcoming Children Literature Festival in November 2026.',
      status: 'resolved',
      offset_hours: 72 // 3 days ago
    },
    {
      name: 'Pooja Deshmukh',
      email: 'pooja.deshmukh@gmail.com',
      phone: '+91 9880890123',
      subject: 'Hindi Subtitles and Regional Language Support',
      message: 'Thank you for providing such wonderful moral stories! Are you planning to add Hindi audio narration or dual language text for bilingual kids?',
      status: 'read',
      offset_hours: 96 // 4 days ago
    },
    {
      name: 'Tanya Bansal',
      email: 'tanya.bansal@gmail.com',
      phone: '+91 9890901234',
      subject: 'Heartfelt thank you from a grateful parent',
      message: 'My daughter learned about kindness from the story of the magical deer. Keep up the tremendous work, our whole family recommends your site!',
      status: 'resolved',
      offset_hours: 120 // 5 days ago
    },
    {
      name: 'Gaurav Kulkarni',
      email: 'gaurav.k@montessori.edu',
      phone: '+91 9801012345',
      subject: 'Bulk access account for preschool classroom teachers',
      message: 'Could we set up an institutional account so that 6 of our lead teachers can bookmark stories for morning circle time sessions?',
      status: 'pending',
      offset_hours: 144 // 6 days ago
    }
  ];

  for (const c of contactsToSeed) {
    const createdSql = `DATE_SUB(NOW(), INTERVAL ${c.offset_hours} HOUR)`;
    const checkQuery = `SELECT id FROM contacts WHERE email = ? AND subject = ?`;
    const existing = await new Promise((resolve, reject) => {
      db.query(checkQuery, [c.email, c.subject], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (existing.length === 0) {
      const insertQuery = `
        INSERT INTO contacts (name, email, phone, subject, message, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ${createdSql})
      `;
      await new Promise((resolve, reject) => {
        db.query(insertQuery, [c.name, c.email, c.phone, c.subject, c.message, c.status], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    } else {
      const updateQuery = `
        UPDATE contacts 
        SET status = ?, created_at = ${createdSql}
        WHERE id = ?
      `;
      await new Promise((resolve, reject) => {
        db.query(updateQuery, [c.status, existing[0].id], (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    }
  }
  console.log(`✅ Seeded ${contactsToSeed.length} contact inquiries with fresh timestamps`);

  // 3. Seed Fresh Newsletter Subscribers
  const newsletterSubscribers = [
    { email: 'ananya.roy@delhischools.edu', status: 'active', offset_hours: 2 },
    { email: 'kavita.patel@gmail.com', status: 'active', offset_hours: 4 },
    { email: 'rohan.mehta@creativekids.org', status: 'active', offset_hours: 6 },
    { email: 'parent.sunita@gmail.com', status: 'active', offset_hours: 8 },
    { email: 'storylover99@yahoo.com', status: 'active', offset_hours: 10 }, // 5 subscribers today!
    { email: 'teacher.manish@school.org', status: 'active', offset_hours: 26 }, // yesterday
    { email: 'priya.sharma2026@gmail.com', status: 'active', offset_hours: 30 },
    { email: 'little.readers.club@gmail.com', status: 'active', offset_hours: 48 }, // 2 days ago
    { email: 'arjun.kapoor@outlook.com', status: 'active', offset_hours: 60 },
    { email: 'bhavna.singh@gmail.com', status: 'active', offset_hours: 72 }, // 3 days ago
    { email: 'neha.verma@gmail.com', status: 'active', offset_hours: 96 },
    { email: 'vikas.dubey@gmail.com', status: 'inactive', offset_hours: 120 }, // inactive
    { email: 'shweta.tiwari@gmail.com', status: 'active', offset_hours: 144 },
    { email: 'tarun.khanna@gmail.com', status: 'active', offset_hours: 180 },
    { email: 'archana.m@gmail.com', status: 'inactive', offset_hours: 240 }
  ];

  for (const sub of newsletterSubscribers) {
    const subSql = `DATE_SUB(NOW(), INTERVAL ${sub.offset_hours} HOUR)`;
    const query = `
      INSERT INTO newsletters (email, status, subscribed_at)
      VALUES (?, ?, ${subSql})
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        subscribed_at = ${subSql}
    `;
    await new Promise((resolve, reject) => {
      db.query(query, [sub.email, sub.status], (err, res) => {
        if (err) reject(err);
        else resolve(res);
      });
    });
  }
  console.log(`✅ Seeded ${newsletterSubscribers.length} newsletter subscribers with fresh timestamps`);

  console.log('🎉 Seeding completed successfully!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
