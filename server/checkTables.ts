import { db } from './db.ts';

async function checkTables() {
  console.log("Checking database tables...");
  
  try {
    const dbInstance = await db;
    console.log("Database connection successful");
    
    // Check if user_profiles table exists
    const userProfilesResult: any = await dbInstance.execute('SHOW TABLES LIKE "user_profiles"');
    console.log("user_profiles table exists:", userProfilesResult[0].length > 0);
    
    // Check if recipes table exists
    const recipesResult: any = await dbInstance.execute('SHOW TABLES LIKE "recipes"');
    console.log("recipes table exists:", recipesResult[0].length > 0);
    
    // Check table structures
    if (userProfilesResult[0].length > 0) {
      const userProfileStructure: any = await dbInstance.execute('DESCRIBE user_profiles');
      console.log("user_profiles structure:");
      console.log(userProfileStructure[0]);
    }
    
    if (recipesResult[0].length > 0) {
      const recipesStructure: any = await dbInstance.execute('DESCRIBE recipes');
      console.log("recipes structure:");
      console.log(recipesStructure[0]);
    }
    
    // Check if we have any data
    const userProfileCount: any = await dbInstance.execute('SELECT COUNT(*) as count FROM user_profiles');
    console.log("Number of user profiles:", userProfileCount[0][0].count);
    
    const recipesCount: any = await dbInstance.execute('SELECT COUNT(*) as count FROM recipes');
    console.log("Number of recipes:", recipesCount[0][0].count);
  } catch (error) {
    console.error("Error checking tables:", error);
  }
}

// Run the check function
checkTables().catch(console.error);