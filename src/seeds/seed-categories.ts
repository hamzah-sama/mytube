import { db } from "@/db";
import { categories } from "@/db/schema";

const categoriesList = [
  "Film & Animation",
  "Autos & Vehicles",
  "Music",
  "Pets & Animals",
  "Sports",
  "Travel & Events",
  "Gaming",
  "Videoblogging",
  "People & Blogs",
  "Comedy",
  "Entertainment",
  "News & Politics",
  "Howto & Style",
  "Education",
  "Science & Technology",
  "Nonprofits & Activism",
];

async function seedCategories() {
  console.log("Seed categories");
  try {
    await Promise.all(
      categoriesList.map(async (category) => {
        return db.insert(categories).values({
          name: category,
          description: `this video related to ${category}`,
        });
      })
    );
    console.log(`${categoriesList.length} categories seeded successfully`);
    process.exit(0);
  } catch (error) {
    console.error(error, { message: "Error seeding categories" });
    process.exit(1);
  }
}

seedCategories();
