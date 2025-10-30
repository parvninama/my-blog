import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../index'
import { FaDiscord, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

function Footer() {
return (
    <footer className="relative w-full bg-yellow-300/90 backdrop-blur-md border-t border-yellow-400 shadow-inner text-gray-800 ">
    <div className="max-w-7xl mx-auto px-6 py-10 ">
        <div className="flex flex-wrap -m-6 ">

        <div className="w-full p-6 md:w-1/2 lg:w-5/12 ">
            <div className="flex h-full flex-col justify-between">
            <div className="mb-4 inline-flex items-center">
                <Logo width="100px" />
            </div>
            <p className="text-sm text-gray-700 ">
                &copy;2025 Built by <span className="font-semibold">Parv</span>.
            </p>
            </div>
        </div>


        <div className="w-full p-6 md:w-1/2 lg:w-3/12">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-700 underline">
                About
            </h3>
            <ul className="space-y-2 ">
            <li>
                <a
                    href="https://github.com/parvninama?tab=repositories"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-black transition 200"
                >
                    My Projects
                </a>
                </li>

                <li>
                <a
                    href="#"
                    className="hover:text-black transition"
                >
                    About Me
                </a>
            </li>

            </ul>
            <div className="flex gap-4 mt-4 text-xl">
            <a href="https://github.com/parvninama" target="_blank" rel="noopener noreferrer" className="hover:text-black">
                <FaGithub />
            </a>
            <a href="https://linkedin.com/in/parv-ninama" target="_blank" rel="noopener noreferrer" className="hover:text-black">
                <FaLinkedin />
            </a>
            <a href="https://discord.com/users/759852791639965707" target="_blank" rel="noopener noreferrer" className="hover:text-black">
                <FaDiscord />
            </a>
            </div>
        </div>

        <div className="w-full p-6 md:w-1/2 lg:w-4/12">
            <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-gray-700 underline">
            Support
        </h3>
        <ul className="space-y-2">
            <li>
            <a href="#" className="hover:text-black transition">
                FAQs
            </a>
            </li>
            <li>
            <a href="mailto:ninamaparv@gmail.com" className="hover:text-black transition">
                Contact Me
            </a>
            </li>
            <li>
            <a
                href="https://github.com/yourusername/yourrepo/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition"
            >
                Report a Bug
            </a>
            </li>
        </ul>
        </div>
        </div>
    </div>
    </footer>
)
}

export default Footer