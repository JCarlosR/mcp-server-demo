import { readFileSync } from "node:fs";

export type Course = {
  title: string;
  short_name: string | null;
  url: string;
  level: string;
  level_en: string;
  skill: string;
  pitch: string;
  description: string;
  topics: string[];
  audience: string[];
  learn: string[];
  priority: number;
};

const catalog = JSON.parse(
  readFileSync(new URL("./data/courses.json", import.meta.url), "utf8"),
) as { courses: Course[] };

const LEVEL_ALIASES: Record<string, string> = {
  aprendiz: "beginner",
  beginner: "beginner",
  principiante: "beginner",
  intermedio: "intermediate",
  intermediate: "intermediate",
  avanzado: "advanced",
  advanced: "advanced",
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function tokenize(value: string): string[] {
  return fold(value)
    .split(/[^a-z0-9+]+/u)
    .filter((token) => token.length > 1);
}

function haystack(course: Course): string {
  return fold(
    [
      course.title,
      course.short_name ?? "",
      course.skill,
      course.pitch,
      course.description,
      course.level,
      course.level_en,
      ...course.topics,
      ...course.audience,
      ...course.learn,
    ].join(" "),
  );
}

function levelMatches(course: Course, level: string): boolean {
  const wanted = LEVEL_ALIASES[fold(level)] ?? fold(level);
  const actual = LEVEL_ALIASES[fold(course.level)] ?? course.level_en;
  return wanted === actual || fold(level) === fold(course.level);
}

export function recommendCourses(topic: string, level?: string, limit = 5): Course[] {
  const tokens = tokenize(topic);
  if (tokens.length === 0) {
    return [];
  }

  const scored = catalog.courses
    .filter((course) => (level ? levelMatches(course, level) : true))
    .map((course) => {
      const text = haystack(course);
      let score = 0;
      for (const token of tokens) {
        if (fold(course.skill) === token) score += 8;
        if (course.topics.some((item) => fold(item) === token)) score += 5;
        if (text.includes(token)) score += 2;
      }
      return { course, score };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => a.course.priority - b.course.priority);

  return scored.slice(0, limit).map((row) => row.course);
}

export function formatCourse(course: Course): string {
  const topics = course.topics.slice(0, 6).join(", ");
  const learn = course.learn.slice(0, 4).map((item) => `- ${item}`).join("\n");
  const lines = [
    `## ${course.title}`,
    course.short_name ? `Also called: ${course.short_name}` : undefined,
    `URL: ${course.url}`,
    `Level: ${course.level} (${course.level_en})`,
    `Skill: ${course.skill}`,
    `Topics: ${topics}`,
    course.pitch,
  ];
  if (learn) {
    lines.push("You will learn:", learn);
  }
  return lines.filter((line): line is string => Boolean(line)).join("\n");
}
