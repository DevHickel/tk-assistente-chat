export const TypingIndicator = () => {
  return (
    <div className="mb-4 flex justify-start animate-fade-in">
      <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm bg-[hsl(var(--chat-assistant-bg))] border border-[hsl(var(--chat-assistant-border))]">
        <div className="flex gap-1">
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: '0s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </div>
  );
};
