import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our story — FrostBite" },
      { name: "description", content: "Why we churn slow, why we ship overnight, and how we got started." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-10">
      <span className="text-xs uppercase tracking-widest text-accent">Our story</span>
      <h1 className="mt-2 font-display text-6xl text-balance">A small freezer in Brooklyn.</h1>
      <p className="mt-8 text-lg leading-relaxed text-foreground/80">
        FrostBite started as a Sunday habit. One copper kettle, one custard base, one stubborn idea: that great ice cream couldn't be made fast.
      </p>
      <p className="mt-6 leading-relaxed text-foreground/70">
        Two years later we still churn every batch by hand, slowly, in the same small kitchen. We source single-origin Madagascar vanilla, Bronte pistachios from the slopes of Mount Etna, and 70% Valrhona for our chocolate. We never use stabilizers, gums, or powdered bases. The freezer holds six flavors at a time. When one sells out, the next one takes its place.
      </p>
      <p className="mt-6 leading-relaxed text-foreground/70">
        Every pint ships overnight, the day it's made, packed in dry ice so it arrives the same temperature it left. That's it. That's the whole story.
      </p>
      <blockquote className="mt-12 border-l-2 border-accent pl-6 font-display text-3xl text-foreground/90">
        We're not trying to scale. We're trying to be the best one you've ever had.
      </blockquote>
    </article>
  );
}
