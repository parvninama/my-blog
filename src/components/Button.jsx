import React from 'react'

function Button({
  children,
  type = 'button',
  bgColor = 'bg-yellow-300',
  textColor = 'text-black',
  className = '',
  hoverColor = 'hover:bg-black hover:text-yellow-300',
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`
        px-4 py-2 rounded-lg font-medium
        ${bgColor} ${textColor} ${hoverColor}
        transition duration-400 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
