import { GraduationCap } from 'lucide-react';

export default function BrandPanel() {
  return (
    <div className="md:w-1/2 bg-gradient-to-br from-navy-950 to-navy-800 text-white flex flex-col justify-center px-8 sm:px-16 py-20">
      <div className="max-w-sm mx-auto md:mx-0 text-center md:text-left">
        <div className="flex items-center gap-3 justify-center md:justify-start mb-10">
          <span className="bg-white text-navy-950 rounded-lg p-2">
            <GraduationCap size={22} />
          </span>
          <span className="leading-tight text-left">
            <span className="block font-bold text-sm tracking-wide">MASTERMIND</span>
            <span className="block text-[10px] text-navy-300 tracking-widest">LEARNING</span>
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold">Ansys Simulation Mastery</h1>
        <p className="mt-4 text-navy-200">
          Master FEA, CFD, and Advanced Computational Solid Mechanics with our
          comprehensive, project-based programme.
        </p>
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">3+</p>
            <p className="text-xs text-navy-300">Courses</p>
          </div>
          <div>
            <p className="text-2xl font-bold">50+</p>
            <p className="text-xs text-navy-300">Hours</p>
          </div>
          <div>
            <p className="text-2xl font-bold">100%</p>
            <p className="text-xs text-navy-300">Practical</p>
          </div>
        </div>
      </div>
    </div>
  );
}
