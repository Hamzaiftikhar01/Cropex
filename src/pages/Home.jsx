import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import UploadCard from '../components/UploadCard';
import Features from '../components/Features';
import AnalysisResult from '../components/AnalysisResult';
import Footer from '../components/Footer';

function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <UploadCard />
        <Features />
        <AnalysisResult />
      </main>
      <Footer />
    </>
  );
}

export default Home;
