#!/usr/bin/env node

/**
 * AGENT LLM Database Setup Script
 * Sets up the database schema for AGENT LLM system
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 Setting up AGENT LLM database...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection established');
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE 'agent_%'
    `;
    
    console.log(`📊 Found ${tables.length} existing AGENT tables`);
    
    // Create seed data for agent examples
    await seedAgentExamples();
    
    console.log('🎉 AGENT LLM database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedAgentExamples() {
  console.log('🌱 Seeding agent examples...');
  
  const examples = [
    // Smart Assistant examples
    {
      agentMode: 'smart_assistant',
      queryText: 'How can I organize my daily tasks more effectively?',
      responseText: 'Here are some effective task organization strategies: 1) Use the Eisenhower Matrix to prioritize tasks by urgency and importance, 2) Implement time-blocking to allocate specific time slots for different activities, 3) Use digital tools like Todoist or Notion for task management, 4) Break large tasks into smaller, manageable subtasks, 5) Review and adjust your system weekly.',
      successRating: 5,
      tags: ['productivity', 'organization', 'time-management']
    },
    {
      agentMode: 'smart_assistant',
      queryText: 'What\'s the best way to schedule meetings with multiple time zones?',
      responseText: 'For scheduling across time zones: 1) Use tools like Calendly or When2meet that automatically handle time zone conversion, 2) Always specify time zones when proposing times (e.g., "2 PM EST / 7 PM GMT"), 3) Consider using a world clock widget to quickly reference multiple zones, 4) Send calendar invites with automatic time zone detection, 5) Be mindful of daylight saving time changes.',
      successRating: 5,
      tags: ['scheduling', 'time-zones', 'meetings']
    },
    
    // Code Companion examples
    {
      agentMode: 'code_companion',
      queryText: 'How do I debug a Python function that\'s returning None?',
      responseText: 'To debug a function returning None: 1) Add print statements or use a debugger to trace execution flow, 2) Check if all code paths have return statements, 3) Verify function parameters and input validation, 4) Use logging to track variable values at different points, 5) Consider using type hints and mypy for static analysis, 6) Test with known inputs to isolate the issue.',
      successRating: 5,
      tags: ['python', 'debugging', 'functions']
    },
    {
      agentMode: 'code_companion',
      queryText: 'What\'s the best way to structure a React component?',
      responseText: 'Best practices for React component structure: 1) Use functional components with hooks for new code, 2) Keep components small and focused on a single responsibility, 3) Use TypeScript for better type safety, 4) Implement proper prop validation, 5) Use custom hooks for reusable logic, 6) Follow consistent naming conventions, 7) Separate business logic from presentation logic.',
      successRating: 5,
      tags: ['react', 'components', 'structure']
    },
    
    // Creative Writer examples
    {
      agentMode: 'creative_writer',
      queryText: 'Help me develop a compelling character for my story',
      responseText: 'To create compelling characters: 1) Give them clear motivations and goals that drive the plot, 2) Create internal conflicts and contradictions that make them human, 3) Develop a backstory that influences their current behavior, 4) Use dialogue to reveal personality and relationships, 5) Show character growth through challenges and decisions, 6) Make them relatable but unique.',
      successRating: 5,
      tags: ['character-development', 'storytelling', 'writing']
    },
    {
      agentMode: 'creative_writer',
      queryText: 'How do I write engaging dialogue between two characters?',
      responseText: 'For engaging dialogue: 1) Each character should have a distinct voice and speaking style, 2) Use subtext - what characters don\'t say is often as important as what they do, 3) Include conflict or tension in conversations, 4) Use dialogue to advance plot and reveal character, 5) Keep it natural and avoid exposition dumps, 6) Use action beats to break up long speeches.',
      successRating: 5,
      tags: ['dialogue', 'character-voice', 'writing-technique']
    },
    
    // Legal Assistant examples
    {
      agentMode: 'legal_assistant',
      queryText: 'What should I look for when reviewing a software license agreement?',
      responseText: 'Key elements to review in software licenses: 1) License scope and permitted uses, 2) Restrictions and prohibited activities, 3) Intellectual property ownership and rights, 4) Liability limitations and disclaimers, 5) Termination conditions and consequences, 6) Data privacy and security provisions, 7) Support and maintenance obligations. Note: This is general guidance only - consult qualified legal counsel for specific advice.',
      successRating: 5,
      tags: ['software-licenses', 'contract-review', 'legal-analysis']
    },
    {
      agentMode: 'legal_assistant',
      queryText: 'How do I ensure my website complies with GDPR requirements?',
      responseText: 'GDPR compliance checklist: 1) Implement clear privacy notices explaining data collection and use, 2) Obtain explicit consent for data processing, 3) Provide data subject rights (access, rectification, erasure, portability), 4) Implement data protection by design and by default, 5) Maintain records of processing activities, 6) Conduct data protection impact assessments for high-risk processing, 7) Appoint a Data Protection Officer if required. Note: This is general guidance - consult qualified legal counsel for specific compliance requirements.',
      successRating: 5,
      tags: ['gdpr', 'privacy', 'compliance']
    },
    
    // Designer Agent examples
    {
      agentMode: 'designer_agent',
      queryText: 'How can I improve the user experience of my mobile app?',
      responseText: 'UX improvement strategies: 1) Conduct user research to understand pain points and needs, 2) Simplify navigation and reduce cognitive load, 3) Optimize for mobile-first with touch-friendly interfaces, 4) Implement consistent design patterns and visual hierarchy, 5) Ensure fast loading times and smooth animations, 6) Test accessibility and include users with disabilities, 7) Iterate based on user feedback and analytics.',
      successRating: 5,
      tags: ['mobile-ux', 'user-experience', 'app-design']
    },
    {
      agentMode: 'designer_agent',
      queryText: 'What color combinations work well for a professional website?',
      responseText: 'Professional color palette recommendations: 1) Use neutral base colors (whites, grays, navy) with one accent color, 2) Ensure sufficient contrast ratios for accessibility (WCAG AA compliance), 3) Consider color psychology - blues convey trust, greens suggest growth, 4) Limit palette to 3-5 colors maximum, 5) Test colors across different devices and lighting conditions, 6) Use color to guide user attention and create visual hierarchy.',
      successRating: 5,
      tags: ['color-theory', 'web-design', 'professional-design']
    }
  ];
  
  for (const example of examples) {
    try {
      await prisma.agentExample.upsert({
        where: {
          id: `${example.agentMode}_${example.queryText.substring(0, 20).replace(/\s+/g, '_')}`
        },
        update: example,
        create: {
          id: `${example.agentMode}_${example.queryText.substring(0, 20).replace(/\s+/g, '_')}`,
          ...example
        }
      });
    } catch (error) {
      console.warn(`⚠️  Could not seed example: ${example.queryText.substring(0, 50)}...`);
    }
  }
  
  console.log(`✅ Seeded ${examples.length} agent examples`);
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase, seedAgentExamples };