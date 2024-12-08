const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const multer = require('multer'); // For file upload
const fs = require('fs');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); 

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3001' })); // Allow requests from frontend
app.use('/uploads', express.static('uploads')); // Serve uploaded files

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // True for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Middleware for JWT authentication
const authenticateJWT = (req, res, next) => {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];

  if (!token) {
    return res.sendStatus(403); // Forbidden
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = user; // Save user information for later use
    next();
  });
};

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Print the generated JWT token to the console
    console.log('Generated JWT token:', token);

    // Based on role, redirect the user to appropriate section
    const dashboard = user.role === 'admin' ? '/admin-dashboard' :
                     user.role === 'power_user' ? '/power-user-dashboard' :
                     '/user-dashboard';

    return res.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, role: user.role },
      token,  // Include the token in the response if needed
      dashboard,
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Magic Link API
app.post('/api/send-magic-link', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours validity
    await pool.execute('INSERT INTO magic_links (email, token, expires_at) VALUES (?, ?, ?)', [email, token, expiresAt]);

    const magicLink = `${process.env.FRONTEND_URL}/onboard?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Complete your registration',
      html: `<p>Click <a href="${magicLink}">this link</a> to complete your registration.</p>`,
    });

    res.json({ message: 'Magic link sent successfully' });
  } catch (error) {
    console.error('Error sending magic link:', error);
    res.status(500).json({ error: 'An error occurred while sending the magic link' });
  }
});

// API to verify magic link token
app.get('/api/verify-token', async (req, res) => {
  const { token } = req.query;
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM magic_links WHERE token = ? AND expires_at > NOW() AND expired = 0',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    res.json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API to expire the token
app.post('/api/expire-token', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    await pool.execute('UPDATE magic_links SET expired = 1 WHERE token = ?', [token]);
    res.json({ message: 'Token expired successfully' });
  } catch (error) {
    console.error('Token expiration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// API to retrieve all magic links
app.get('/api/magic-links', async (req, res) => {
  try {
    const [magicLinks] = await pool.execute('SELECT * FROM magic_links');
    res.json(magicLinks);
  } catch (error) {
    console.error('Error fetching magic links:', error);
    res.status(500).json({ error: 'Failed to fetch magic links' });
  }
});


// API endpoint to submit candidate data
app.post('/api/submit-candidate', upload.single('resume'), async (req, res) => {
  const {
      first_name,
      last_name,
      phone_no,
      address_line1,
      address_line2,
      city,
      state,
      country,
      postal_code,
      linkedin_url,
      username,
      password,
      email,
      recent_job,
      preferred_roles,
      availability,
      work_permit_status,
      preferred_role_type,
      preferred_work_arrangement,
      preferred_compensation_range, // Ensure this is included
      skills,
      certifications,
  } = req.body;

  try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the users table
      const [userResult] = await pool.execute(
          'INSERT INTO users (username, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
          [username, email, hashedPassword, 'user']
      );

      // Insert personal details
      await pool.execute(
          'INSERT INTO personaldetails (id, first_name, last_name, phone_no, address_line1, address_line2, city, state, country, postal_code, linkedin_url, resume_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [userResult.insertId, first_name, last_name, phone_no, address_line1, address_line2, city, state, country, postal_code, linkedin_url, req.file.path]
      );

              // Insert qualifications
              await pool.execute(
                'INSERT INTO qualifications (id, recent_job, preferred_roles, availability, work_permit_status, preferred_role_type, preferred_work_arrangement, compensation, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
                [userResult.insertId, recent_job, preferred_roles, availability, work_permit_status, preferred_role_type, preferred_work_arrangement, preferred_compensation_range] // Include compensation here
            );
    
            // Insert skills
            if (skills && skills.length > 0) {
                for (const skillName of skills) {
                    // Check if the skill already exists
                    const [skillRows] = await pool.execute('SELECT skill_id FROM skills WHERE skill_name = ?', [skillName]);
                    let skillId;
    
                    if (skillRows.length > 0) {
                        skillId = skillRows[0].skill_id;
                    } else {
                        // If the skill does not exist, insert it into the skills table
                        const [insertSkillResult] = await pool.execute('INSERT INTO skills (skill_name) VALUES (?)', [skillName]);
                        skillId = insertSkillResult.insertId; // Get the ID of the newly inserted skill
                    }
    
                    // Now insert the user-skill relationship into the user_skills table
                    await pool.execute(
                        'INSERT INTO user_skills (id, skill_id) VALUES (?, ?)',
                        [userResult.insertId, skillId]
                    );
                }
            }
    
            // Insert certifications
            if (certifications && certifications.length > 0) {
                for (const certificationName of certifications) {
                    // Check if the certification already exists
                    const [certRows] = await pool.execute('SELECT certification_id FROM certifications WHERE certification_name = ?', [certificationName]);
                    let certId;
    
                    if (certRows.length > 0) {
                        certId = certRows[0].certification_id;
                    } else {
                        // If the certification does not exist, insert it into the certifications table
                        const [insertCertResult] = await pool.execute('INSERT INTO certifications (certification_name) VALUES (?)', [certificationName]);
                        certId = insertCertResult.insertId; // Get the ID of the newly inserted certification
                    }
    
                    // Now insert the user-certification relationship into the user_certifications table
                    await pool.execute(
                        'INSERT INTO user_certifications (id, certification_id) VALUES (?, ?)',
                        [userResult.insertId, certId]
                    );
                }
            }
    
            // Send a success response
            res.status(201).json({ message: 'Candidate data submitted successfully!' });
        } catch (error) {
            console.error('Error submitting candidate data:', error);
            res.status(500).json({ message: 'An error occurred while submitting candidate data.' });
        }
    });

// Endpoint to view the resume
app.get('/api/resume/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT resume_path FROM personaldetails WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0 || !rows[0].resume_path) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const filePath = rows[0].resume_path;

    // Set headers to ensure the file is viewed in the browser
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline'); // Forces inline display instead of download
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Endpoint to download/view the resume
app.get('/api/resume/:id', async (req, res) => {
  try {
      const [rows] = await pool.execute(
          'SELECT resume_path FROM personaldetails WHERE id = ?',
          [req.params.id]
      );

      if (rows.length === 0 || !rows[0].resume_path) {
          return res.status(404).json({ error: 'Resume not found' });
      }

      const filePath = rows[0].resume_path;
      res.sendFile(path.resolve(filePath));
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});


// API to retrieve all candidates (for Admin Dashboard)

app.get('/api/candidates', async (req, res) => {
  try {
    const query = `
      SELECT u.id, pd.first_name, pd.last_name, u.role,u.username,u.email
      FROM users u
      JOIN personaldetails pd ON u.id = pd.id
    `;
    const [candidates] = await pool.execute(query);
    res.json(candidates);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// API endpoint to get all skills
app.get('/api/skills', async (req, res) => {
  try {
    const [skills] = await pool.execute('SELECT skill_name FROM skills');
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// API endpoint to get all certifications
app.get('/api/certifications', async (req, res) => {
  try {
    const [certifications] = await pool.execute('SELECT certification_name FROM certifications');
    res.json(certifications);
  } catch (error) {
    console.error('Error fetching certifications:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint to get personal details by candidate ID
app.get('/api/personalDetails/:id', async (req, res) => {
  try {
    // Fetch personal details
    const [personalDetails] = await pool.execute(
      'SELECT * FROM personaldetails WHERE id = ?',
      [req.params.id]
    );

    if (personalDetails.length === 0) {
      return res.status(404).json({ error: 'Personal details not found' });
    }

   // Fetch username
   const [users] = await pool.execute(
    'SELECT * FROM users WHERE id = ?',
    [req.params.id]
  );

    // Fetch qualifications
    const [qualifications] = await pool.execute(
      'SELECT recent_job, preferred_roles, availability, work_permit_status, preferred_role_type, preferred_work_arrangement, compensation FROM qualifications WHERE id = ?',
      [req.params.id]
    );

    // Fetch skills
    const [skills] = await pool.execute(
      'SELECT s.skill_name FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.id = ?',
      [req.params.id]
    );

    // Fetch certifications
    const [certifications] = await pool.execute(
      'SELECT c.certification_name FROM user_certifications uc JOIN certifications c ON uc.certification_id = c.certification_id WHERE uc.id = ?',
      [req.params.id]
    );

    res.json({
      personalDetails: personalDetails[0],
      qualifications,
      users:users[0],
      skills: skills.map(skill => skill.skill_name),
      certifications: certifications.map(cert => cert.certification_name),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update personal details
app.put('/api/candidates/:id/personal', upload.single('resume'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    phone_no,
    address_line1,
    address_line2,
    city,
    state,
    country,
    postal_code,
    linkedin_url,
  } = req.body;

  // Get the path of the uploaded resume if it exists
  const resumePath = req.file ? req.file.path : null;

  try {
    // Prepare dynamic query and parameters
    const fieldsToUpdate = [];
    const values = [];

    if (first_name) {
      fieldsToUpdate.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name) {
      fieldsToUpdate.push('last_name = ?');
      values.push(last_name);
    }
    if (phone_no) {
      fieldsToUpdate.push('phone_no = ?');
      values.push(phone_no);
    }
    if (address_line1) {
      fieldsToUpdate.push('address_line1 = ?');
      values.push(address_line1);
    }
    if (address_line2) {
      fieldsToUpdate.push('address_line2 = ?');
      values.push(address_line2);
    }
    if (city) {
      fieldsToUpdate.push('city = ?');
      values.push(city);
    }
    if (state) {
      fieldsToUpdate.push('state = ?');
      values.push(state);
    }
    if (country) {
      fieldsToUpdate.push('country = ?');
      values.push(country);
    }
    if (postal_code) {
      fieldsToUpdate.push('postal_code = ?');
      values.push(postal_code);
    }
    if (linkedin_url) {
      fieldsToUpdate.push('linkedin_url = ?');
      values.push(linkedin_url);
    }
    if (resumePath) {
      fieldsToUpdate.push('resume_path = ?');
      values.push(resumePath);
    }

    // If no fields to update, return an error
    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'No fields provided to update.' });
    }

    // Add the candidate ID to the values array for the WHERE clause
    values.push(id);

    // Construct the SQL query
    const query = `UPDATE personaldetails SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;

    // Execute the query
    await pool.execute(query, values);

    res.status(200).json({ message: 'Personal details updated successfully!' });
  } catch (error) {
    console.error('Error updating personal details:', error);
    res.status(500).json({ message: 'An error occurred while updating personal details.' });
  }
});


// Update qualifications
app.put('/api/candidates/:id/qualifications', async (req, res) => {
  const { id } = req.params;
  const {
      recent_job,
      preferred_roles,
      availability,
      work_permit_status,
      preferred_role_type,
      preferred_work_arrangement,
      compensation, // Ensure this is the correct name
  } = req.body;

  // Prepare values, replacing undefined with null
  const values = [
      recent_job || null,
      preferred_roles || null,
      availability || null,
      work_permit_status || null,
      preferred_role_type || null,
      preferred_work_arrangement || null,
      compensation|| null, // Ensure this matches the SQL column name
      id // Ensure this ID corresponds to the qualifications entry
  ];

  try {
      const [result] = await pool.execute(
          'UPDATE qualifications SET recent_job = ?, preferred_roles = ?, availability = ?, work_permit_status = ?, preferred_role_type = ?, preferred_work_arrangement = ?, compensation = ? WHERE id = ?',
          values
      );

      // Check if any rows were affected
      if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Qualifications not found or no changes made.' });
      }

      res.status(200).json({ message: 'Qualifications updated successfully!' });
  } catch (error) {
      console.error('Error updating qualifications:', error);
      res.status(500).json({ message: 'An error occurred while updating qualifications.', error: error.message });
  }
});


// Update skills
app.put('/api/candidates/:id/skills', async (req, res) => {
  const { id } = req.params;
  const { skills } = req.body;

  try {
    // First, delete existing skills for the candidate
    await pool.execute('DELETE FROM user_skills WHERE id = ?', [id]);

    for (const skillName of skills) {
      const [skillRows] = await pool.execute('SELECT skill_id FROM skills WHERE skill_name = ?', [skillName]);
      let skillId;

      if (skillRows.length > 0) {
        skillId = skillRows[0].skill_id;
      } else {
        const [insertSkillResult] = await pool.execute('INSERT INTO skills (skill_name) VALUES (?)', [skillName]);
        skillId = insertSkillResult.insertId;
      }

      await pool.execute(
        'INSERT INTO user_skills (id, skill_id) VALUES (?, ?)',
        [id, skillId]
      );
    }

    res.status(200).json({ message: 'Skills updated successfully!' });
  } catch (error) {
    console.error('Error updating skills:', error);
    res.status(500).json({ message: 'An error occurred while updating skills.' });
  }
});

// Update certifications
app.put('/api/candidates/:id/certifications', async (req, res) => {
  const { id } = req.params;
  const { certifications } = req.body;

  try {
    // First, delete existing certifications for the candidate
    await pool.execute('DELETE FROM user_certifications WHERE id = ?', [id]);

    for (const certificationName of certifications) {
      const [certRows] = await pool.execute('SELECT certification_id FROM certifications WHERE certification_name = ?', [certificationName]);
      let certId;

      if (certRows.length > 0) {
        certId = certRows[0].certification_id;
      } else {
        const [insertCertResult] = await pool.execute('INSERT INTO certifications (certification_name) VALUES (?)', [certificationName]);
        certId = insertCertResult.insertId;
      }

      await pool.execute(
        'INSERT INTO       user_certifications (id, certification_id) VALUES (?, ?)',
        [id, certId]
      );
    }

    res.status(200).json({ message: 'Certifications updated successfully!' });
  } catch (error) {
    console.error('Error updating certifications:', error);
    res.status(500).json({ message: 'An error occurred while updating certifications.' });
  }
});


// API to delete a candidate
app.delete('/api/candidates/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [existingCandidate] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (existingCandidate.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});
// API to delete a candidate's personal details
app.delete('/api/personaldetails/:id', async (req, res) => {
  const { id } = req.params;

  try {
      await pool.execute('DELETE FROM personaldetails WHERE id = ?', [id]);
      res.status(200).json({ message: 'Personal details deleted successfully' });
  } catch (error) {
      console.error('Error deleting personal details:', error);
      res.status(500).json({ error: 'Failed to delete personal details' });
  }
});
// API to delete a candidate's qualifications
app.delete('/api/qualifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const [result] = await pool.execute('DELETE FROM qualifications WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Qualifications not found' });
      }
      res.status(200).json({ message: 'Qualifications deleted successfully' });
  } catch (error) {
      console.error('Error deleting qualifications:', error);
      res.status(500).json({ error: 'Failed to delete qualifications' });
  }
});

// API to delete a candidate's skills
app.delete('/api/user_skills/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const [result] = await pool.execute('DELETE FROM user_skills WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User  skills not found' });
      }
      res.status(200).json({ message: 'User  skills deleted successfully' });
  } catch (error) {
      console.error('Error deleting user skills:', error);
      res.status(500).json({ error: 'Failed to delete user skills' });
  }
});

// API to delete a candidate's certifications
app.delete('/api/user_certifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const [result] = await pool.execute('DELETE FROM user_certifications WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'User  certifications not found' });
      }
      res.status(200).json({ message: 'User  certifications deleted successfully' });
  } catch (error) {
      console.error('Error deleting user certifications:', error);
      res.status(500).json({ error: 'Failed to delete user certifications' });
  }
});


// API to get logged-in user's information by email
app.get('/api/user/info/email', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const [user] = await pool.execute('SELECT id, username, email, role FROM users WHERE email = ?', [email]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

// API to update logged-in user's information by email
app.put('/api/user/info/email', upload.single('resume'), async (req, res) => {
  const { email } = req.query;
  const { name, phone, address } = req.body;
  const resumePath = req.file ? req.file.path : null;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const updates = [];
  const values = [];

  if (name) {
    updates.push('name = ?');
    values.push(name);
  }
  if (phone) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (address) {
    updates.push('address = ?');
    values.push(address);
  }
  if (resumePath) {
    updates.push('resume_path = ?');
    values.push(resumePath);
  }

  values.push(email);

  try {
    const query = `UPDATE candidates SET ${updates.join(', ')} WHERE email = ?`;
    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User  not found' });
    }

    res.json({ message: 'User  information updated successfully' });
  } catch (error) {
    console.error('Error updating user info:', error);
    res.status(500).json({ error: 'Failed to update user info' });
  }
});

// API to update a candidate's role
app.put('/api/candidates/:id/role', async (req, res) => {
  const { id } = req.params;
  const { role } = req.body; // The new role to assign (e.g., "power_user")

  if (!['user', 'power_user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  try {
    const [existingCandidate] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);

    if (existingCandidate.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    const query = 'UPDATE users SET role = ? WHERE id = ?';
    await pool.execute(query, [role, id]);

    res.status(200).json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Serve React build files
app.use(express.static(path.join(__dirname, '../onevector-frontend/build')));

// Fallback route to handle unknown routes (serving the React app)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../onevector-frontend/build/index.html'));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));