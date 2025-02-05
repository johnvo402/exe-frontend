import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start bg-gray-100 min-h-screen p-8">
      {/* Left Section */}
      <div className="bg-gray-200 p-8 flex flex-col items-center justify-center w-full min-h-screen md:w-1/2">
        <div className="bg-white p-1 shadow-md">
          <Image src="/logo.png" alt="OSTY Logo" width={200} height={200} />
        </div>
        <h2 className="mt-4 font-bold text-4xl">OWN STYLE</h2>
        <a
          href="mailto:osty.ownstyle@gmail.com"
          className="mt-4 bg-black text-white px-6 py-2 text-center"
        >
          Email me
        </a>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center min-h-screen">
        <h1 className="text-3xl font-bold">About US</h1>
        <p className="italic mt-2">"Fashion, just for you."</p>
        <p className="mt-4 text-gray-700">
          OSTY-OWN STYLE - where fashion becomes truly unique. We help you
          create unique outfits that reflect your personality and lifestyle.
          From the boldest ideas, OSTY-OWN STYLE will turn them into reality
          through design and production services on demand. With high-quality
          materials and meticulous tailoring, each of our products is a unique
          work of fashion art.
        </p>
      </div>
    </div>
  );
}
