// server.js - Node.js/Express backend proxy
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

// Enable CORS for your frontend domain
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://yourdomain.com']
}));

app.use(express.json());

// Food & Home category mapping
const FOOD_AND_HOME_CATEGORIES = {
  breakfast: 2608,
  lunch: 26191,
  'vegan-veg': 2602,
  meats: 26234,
  dinner: 2609,
  desserts: 2593,
};

// Helper function to clean HTML entities
const cleanTitle = (title) => {
  return title
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
};

// Helper function to extract image from content
const extractImage = (post) => {
  // Try embedded media first
  if (post._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return post._embedded['wp:featuredmedia'][0].source_url;
  }
  
  // Try to extract from content HTML
  const imgMatch = post.content.rendered.match(/src="([^"]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  
  return null;
};

// Helper function to parse ingredients and instructions
const parseRecipeData = (content) => {
  const ingredients = [];
  const instructions = [];
  
  // Extract ingredients
  const ingredientMatches = content.match(/<li><span>([^<]+)<\/span><\/li>/g);
  if (ingredientMatches) {
    ingredientMatches.forEach(match => {
      const ingredient = match.match(/<span>([^<]+)<\/span>/)?.[1];
      if (ingredient) {
        ingredients.push(ingredient.trim());
      }
    });
  }
  
  // Extract instructions
  const stepMatches = content.match(/<div class="step-content">\s*<p>([^<]+)<\/p>/g);
  if (stepMatches) {
    stepMatches.forEach(match => {
      const instruction = match.match(/<p>([^<]+)<\/p>/)?.[1];
      if (instruction) {
        instructions.push(instruction.trim());
      }
    });
  }
  
  return { ingredients, instructions };
};

// API endpoint to fetch recipes by category
app.get('/api/recipes/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 3 } = req.query;
    
    // Validate category
    const categoryId = FOOD_AND_HOME_CATEGORIES[category];
    if (!categoryId) {
      return res.status(400).json({ 
        error: 'Invalid category',
        validCategories: Object.keys(FOOD_AND_HOME_CATEGORIES)
      });
    }
    
    console.log(`Fetching ${category} recipes from Food & Home API...`);
    
    // Fetch from Food & Home API
    const apiUrl = `https://www.foodandhome.co.za/wp-json/wp/v2/posts?categories=${categoryId}&per_page=${limit}&_embed=true`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.foodandhome.co.za/',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000 // 10 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Food & Home API returned ${response.status}: ${response.statusText}`);
    }
    
    const posts = await response.json();
    
    if (!Array.isArray(posts)) {
      throw new Error('Invalid response format from Food & Home API');
    }
    
    // Transform the data for frontend
    const recipes = posts.map(post => {
      const { ingredients, instructions } = parseRecipeData(post.content.rendered);
      
      return {
        id: post.id.toString(),
        name: cleanTitle(post.title.rendered),
        image: extractImage(post),
        category: category,
        slug: post.slug,
        link: post.link,
        excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').trim(),
        ingredients,
        instructions,
        datePublished: post.date,
        content: post.content.rendered
      };
    });
    
    console.log(`✅ Successfully fetched ${recipes.length} ${category} recipes`);
    
    res.json({
      success: true,
      category,
      count: recipes.length,
      recipes
    });
    
  } catch (error) {
    console.error(`❌ Error fetching ${req.params.category} recipes:`, error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipes from Food & Home',
      message: error.message,
      category: req.params.category
    });
  }
});

// Endpoint to fetch multiple categories at once
app.post('/api/recipes/batch', async (req, res) => {
  try {
    const { categories, limit = 3 } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ error: 'Categories must be an array' });
    }
    
    console.log(`Batch fetching recipes for categories: ${categories.join(', ')}`);
    
    // Fetch all categories in parallel
    const promises = categories.map(async (category) => {
      try {
        const categoryId = FOOD_AND_HOME_CATEGORIES[category];
        if (!categoryId) return { category, recipes: [], error: 'Invalid category' };
        
        const apiUrl = `https://www.foodandhome.co.za/wp-json/wp/v2/posts?categories=${categoryId}&per_page=${limit}&_embed=true`;
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'RecipeApp/1.0',
            'Accept': 'application/json',
          },
          timeout: 10000
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const posts = await response.json();
        const recipes = posts.map(post => {
          const { ingredients, instructions } = parseRecipeData(post.content.rendered);
          
          return {
            id: post.id.toString(),
            name: cleanTitle(post.title.rendered),
            image: extractImage(post),
            category: category,
            slug: post.slug,
            link: post.link,
            excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').trim(),
            ingredients,
            instructions,
            datePublished: post.date
          };
        });
        
        return { category, recipes, count: recipes.length };
        
      } catch (error) {
        console.error(`Error fetching ${category}:`, error.message);
        return { category, recipes: [], error: error.message };
      }
    });
    
    const results = await Promise.all(promises);
    
    res.json({
      success: true,
      results,
      totalCategories: categories.length,
      successfulCategories: results.filter(r => r.recipes.length > 0).length
    });
    
  } catch (error) {
    console.error('Batch fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch recipe fetch failed',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    availableCategories: Object.keys(FOOD_AND_HOME_CATEGORIES)
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Recipe proxy server running on port ${PORT}`);
  console.log(`📝 Available endpoints:`);
  console.log(`   GET  /api/recipes/:category?limit=3`);
  console.log(`   POST /api/recipes/batch`);
  console.log(`   GET  /api/health`);
});