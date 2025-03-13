export function PatternBackground() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-white"
      style={{
        backgroundImage: 'url("/placeholder.svg?height=200&width=200")',
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
        opacity: 1,
      }}
    />
  )
}

