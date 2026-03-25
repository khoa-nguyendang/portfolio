import { SEOHead } from '@/components/SEOHead';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Skills } from '@/components/Skills';
import { Experience } from '@/components/Experience';
import { Education } from '@/components/Education';
import { Certifications } from '@/components/Certifications';
import { getYearsOfExperience } from '@/utils/career';

export default function HomePage() {
  const years = getYearsOfExperience();
  return (
    <>
      <SEOHead
        title="Khoa Nguyen Dang - Senior Solution Architect & Full-Stack Engineer"
        description={`Portfolio of Khoa Nguyen Dang - Senior Solution Architect & Full-Stack Engineer with ${years}+ years of experience in cloud architecture, microservices, and AI/ML.`}
        ogTitle="Khoa Nguyen Dang - Portfolio"
        ogDescription={`Senior Solution Architect & Full-Stack Engineer with ${years}+ years of experience.`}
      />
      <Hero />
      <About />
      <Skills />
      <Experience />
      <Education />
      <Certifications />
    </>
  );
}
