import { useState, useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllBlogs } from "@/hooks/lib/blogUtils";
import { Blog } from "@/types/blog";

// Dummy full content for each blog article
const blogArticles: Record<number, { title: string; content: string; author: string }> = {
	1: {
		title: "10 Effective Study Techniques for Competitive Exams",
		content:
			"Here is a detailed article about 10 effective study techniques. Use spaced repetition, active recall, and practice tests to maximize your retention. Stay organized and take regular breaks for best results. Understanding your learning style is crucial for selecting the right techniques. Create a study environment that minimizes distractions and enhances focus. Combine multiple techniques for better results and long-term retention. Track your progress regularly to identify areas needing improvement. Remember that consistency matters more than intensive cramming sessions.",
		author: "Dr. Sarah Johnson",
	},
	2: {
		title: "Time Management Strategies for GATE Preparation",
		content:
			"This article covers time management tips for GATE. Prioritize topics, set realistic goals, and use a planner. Regular revision and mock tests are key to success. Break down your syllabus into manageable weekly targets to avoid overwhelming yourself. Allocate more time to challenging subjects while maintaining touch with easier topics. Use time-blocking techniques to dedicate specific hours to different subjects. Analyze your mock test performance to optimize your study schedule accordingly. Leave buffer time for unexpected challenges and additional revision needs. Balance preparation with adequate rest to maintain peak cognitive performance.",
		author: "Prof. Rajesh Kumar",
	},
	3: {
		title: "Mental Health During Exam Preparation",
		content:
			"Maintaining mental health is crucial. Practice mindfulness, take breaks, and seek support when needed. Balance your studies with relaxation and hobbies. Recognize early signs of burnout such as fatigue, irritability, and declining motivation. Establish a support network of friends, family, and peers who understand your journey. Exercise regularly to release endorphins and reduce stress hormones naturally. Get adequate sleep as it's essential for memory consolidation and cognitive function. Don't hesitate to consult mental health professionals if anxiety becomes overwhelming. Remember that your well-being is more important than any exam result.",
		author: "Dr. Priya Sharma",
	},
	4: {
		title: "Latest EdTech Innovations in 2025",
		content:
			"Explore how technology is transforming education and exam prep. From AI tutors to adaptive learning platforms, technology is making learning more personalized and effective. Virtual reality classrooms are creating immersive learning experiences for complex concepts. Gamification elements are increasing student engagement and making learning more enjoyable. Data analytics help educators identify student weaknesses and customize interventions accordingly. Blockchain technology is being used to verify credentials and create portable learning records. Mobile learning apps enable students to study anytime, anywhere at their convenience. The integration of IoT devices is creating smart classrooms with enhanced interactive capabilities.",
		author: "Amit Verma",
	},
	5: {
		title: "From Failure to GATE Topper: The Story of Neha Singh",
		content:
			"After facing setbacks in two attempts, Neha's journey to becoming a GATE topper is truly inspiring. She restructured her approach, focused on fundamentals, and maintained consistency in her preparation. Her story teaches us that failure is not the end, but a stepping stone to success. Neha analyzed her previous mistakes and identified knowledge gaps systematically. She joined a study group which provided motivation and accountability throughout her journey. Regular self-assessment through mock tests helped her track improvement and build confidence. She developed a positive mindset by celebrating small wins and learning from setbacks. Her dedication to understanding concepts deeply rather than rote memorization paid off. Neha's transformation shows that perseverance and smart work can overcome initial failures.",
		author: "Editorial Team",
	},
	6: {
		title: "Pomodoro Technique: Boost Focus in 25-Minute Intervals",
		content:
			"The Pomodoro Technique is a time management method that uses a timer to break work into focused 25-minute intervals, separated by short breaks. This approach helps maintain high levels of focus while preventing mental fatigue. Learn how to implement this technique effectively in your study routine. Choose a single task to focus on during each Pomodoro session. After four Pomodoros, take a longer break of 15-30 minutes to recharge. Eliminate all distractions including phone notifications during your focused intervals. Track completed Pomodoros to measure productivity and identify peak performance times. Adjust interval lengths based on your personal focus capacity and subject complexity. The technique works best when combined with proper planning and task prioritization.",
		author: "Ritika Patel",
	},
	7: {
		title: "GATE 2025 Syllabus Simplified: Key Changes & Topics to Focus",
		content:
			"A comprehensive analysis of the GATE 2025 syllabus changes. We break down the high-weightage topics, highlight new additions, and provide strategic advice for preparation. Special focus on updated sections and recommended study resources. New emphasis on application-based questions requires deeper conceptual understanding rather than memorization. Data structures and algorithms now carry increased weightage in computer science papers. Environmental engineering topics have been updated to reflect current sustainability challenges. Machine learning fundamentals have been added to several engineering streams. The exam pattern now includes more multi-select questions testing comprehensive knowledge. Updated reference materials and standard textbooks are recommended for thorough coverage.",
		author: "Prof. Manish Tiwari",
	},
	8: {
		title: "Mindfulness Techniques to Beat Exam Anxiety",
		content:
			"Discover practical mindfulness exercises designed specifically for students. Learn breathing techniques, meditation practices, and stress-management strategies that can help you stay calm and focused during exam preparation and on the big day. Practice the 4-7-8 breathing technique to activate your parasympathetic nervous system instantly. Body scan meditation helps identify and release physical tension caused by stress. Mindful walking breaks can refresh your mind between intense study sessions. Visualization exercises build confidence by mentally rehearsing successful exam performance. Keep a gratitude journal to maintain perspective and positive mental state. Progressive muscle relaxation techniques reduce physical symptoms of anxiety effectively.",
		author: "Dr. Aisha Khan",
	},
	9: {
		title: "AI in Education: How Smart Systems Personalize Learning",
		content:
			"An in-depth look at how AI is revolutionizing education. From adaptive learning algorithms to intelligent tutoring systems, explore how technology is creating personalized learning experiences. Real-world examples and future trends in educational technology. AI-powered assessment tools provide instant feedback and identify learning gaps accurately. Natural language processing enables conversational interfaces for doubt resolution anytime. Predictive analytics help forecast student performance and suggest intervention strategies early. Personalized content recommendations ensure students focus on relevant materials for their level. Automated grading systems free up educators to focus on mentoring and guidance. Ethical considerations around data privacy and algorithmic bias remain important challenges.",
		author: "Rahul Mehta",
	},
	10: {
		title: "The Journey of a Self-Taught Programmer Who Landed at Google",
		content:
			"An inspiring story of determination and self-learning. Follow the journey from writing the first line of code to clearing Google's technical interviews. Includes practical advice on self-study, project building, and interview preparation. Started with free online resources like freeCodeCamp and gradually progressed to advanced topics. Built a portfolio of diverse projects demonstrating problem-solving skills and technical proficiency. Contributed to open-source projects to gain real-world development experience and community recognition. Practiced data structures and algorithms daily on platforms like LeetCode and HackerRank. Networked with professionals through tech meetups and online communities for mentorship. The key was maintaining consistent daily practice and never giving up despite initial rejections.",
		author: "Team LearnWise",
	},
};

export const FeaturedBlog = () => {
	const [openBlogId, setOpenBlogId] = useState<number | null>(null);
	const [blogs, setBlogs] = useState<Blog[]>([]);

	// Load all blogs on mount
	useEffect(() => {
		const allBlogs = getAllBlogs();
		setBlogs(allBlogs);
	}, []);

	if (openBlogId) {
		const selectedBlog = blogs.find(blog => blog.id === openBlogId);
		if (selectedBlog) {
			return (
				<div className="max-w-2xl mx-auto py-10 px-4 animate-fade-in">
					<Button
						variant="link"
						onClick={() => setOpenBlogId(null)}
						className="mb-4 p-0 h-auto"
					>
						← Back to Blogs
					</Button>
					<h1 className="text-3xl font-bold mb-4">{selectedBlog.title}</h1>
					<div className="text-muted-foreground mb-2">By {selectedBlog.author}</div>
					<img
						src={selectedBlog.image}
						alt={selectedBlog.title}
						className="w-full rounded-lg mb-6"
					/>
					<div className="text-lg whitespace-pre-wrap">{selectedBlog.content}</div>
					{selectedBlog.isUserCreated && (
						<div className="mt-6 p-4 bg-accent/30 rounded-lg flex items-center gap-2">
							<Sparkles className="w-5 h-5 text-primary" />
							<span className="text-sm">Community Contribution</span>
						</div>
					)}
				</div>
			);
		}
	}

	// Display all blogs
	const featuredBlogs = blogs;

	return (
		<div className="mb-16 space-y-12">
			{featuredBlogs.map((featuredBlog) => (
				<Card
					key={featuredBlog.id}
					className="border-0 shadow-strong overflow-hidden"
				>
					<div className="grid md:grid-cols-2 gap-0">
						<div className="aspect-video md:aspect-auto bg-gradient-card overflow-hidden">
							<img
								src={featuredBlog.image}
								alt={featuredBlog.title}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="p-8">
							<div className="flex items-center gap-2 mb-4">
								<Badge variant="secondary">
									{featuredBlog.category}
								</Badge>
								{featuredBlog.isUserCreated && (
									<Sparkles className="w-5 h-5 text-primary" />
								)}
							</div>
							<h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
								{featuredBlog.title}
							</h2>
							<p className="text-muted-foreground text-lg mb-6 leading-relaxed">
								{featuredBlog.excerpt}
							</p>
							<Button
								variant="hero"
								size="lg"
								onClick={() => setOpenBlogId(featuredBlog.id)}
							>
								Read Article
								<ArrowRight className="ml-2 h-5 w-5" />
							</Button>
						</div>
					</div>
				</Card>
			))}
		</div>
	);
};
