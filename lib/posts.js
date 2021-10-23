import fs from "fs";
import matter from "gray-matter";
import path from "path";
import remark from "remark";
import html from "remark-html";

const POSTS_DIRECTORY = path.join(process.cwd(), "posts");

export const getSortedPostsData = () => {
  // Get file names under directory `/posts`
  const fileNames = fs.readdirSync(POSTS_DIRECTORY);
  const allPostsData = fileNames.map((fileName) => {
    // Remove extension `.md` from file name to get ID
    const id = fileName.replace(/\.md$/, "");

    // Read markdown file as string
    const fullPath = path.join(POSTS_DIRECTORY, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // Use gray-matter module to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the ID
    return {
      id,
      ...matterResult.data,
    };
  });

  // Sort posts by date
  return allPostsData.sort(({ date: a }, { date: b }) => {
    if (a < b) {
      return 1;
    } else if (a > b) {
      return -1;
    } else {
      return 0;
    }
  });
};

export const getAllPostIds = () => {
  const fileNames = fs.readdirSync(POSTS_DIRECTORY);

  // Returns an array that looks like this:
  // [
  //   {
  //     params: {
  //       id: "ssg-ssr"
  //     }
  //   },
  //   {
  //     params: {
  //       id: "pre-rendering"
  //     }
  //   },
  // ]

  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.md$/, ""),
      },
    };
  });
};

export const getPostData = async (id) => {
  const fullPath = path.join(POSTS_DIRECTORY, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf-8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);

  const contentHtml = processedContent.toString();

  // Combine the data with the id
  return {
    id,
    contentHtml,
    ...matterResult.data,
  };
};
