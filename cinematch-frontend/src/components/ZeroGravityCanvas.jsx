import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";

const TMDB_POSTER_BASE_URL = "https://image.tmdb.org/t/p/w500";
const POSTER_WIDTH = 500;
const MAX_SPEED = 4;
const MAX_POSTER_BODIES = 14;
const MOTION_FORCE_SCALE = 0.00008;
const MOTION_FRAME_INTERVAL = 1000 / 30;

function playCollisionSound() {
  // Placeholder for future collision audio integration.
}

function ZeroGravityCanvas({ movies = [] }) {
  const [activeMovie, setActiveMovie] = useState(null);
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const worldRef = useRef(null);
  const renderRef = useRef(null);
  const runnerRef = useRef(null);
  const mouseConstraintRef = useRef(null);
  const selectedBodyRef = useRef(null);
  const modalBodyRef = useRef(null);
  const bodiesRef = useRef([]);
  const boundsRef = useRef({ width: 800, height: 600 });
  const animationFrameRef = useRef(null);
  const pointerDownBodyRef = useRef(null);
  const didDragRef = useRef(false);
  const frozenVelocityRef = useRef({ x: 0, y: 0, angular: 0 });
  const lastForceTimeRef = useRef(0);

  useEffect(() => {
    if (!containerRef.current || engineRef.current) {
      return undefined;
    }

    const {
      Bodies,
      Body,
      Composite,
      Engine,
      Events,
      Mouse,
      MouseConstraint,
      Render,
      Runner,
      World,
    } = Matter;
    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const wallThickness = 50;

    boundsRef.current = { width, height };

    const engine = Engine.create();
    engine.gravity.x = 0;
    engine.gravity.y = 0;

    const world = engine.world;
    const render = Render.create({
      element: container,
      engine,
      options: {
        width,
        height,
        wireframes: false,
        background: "transparent",
        pixelRatio: 1,
      },
    });
    const runner = Runner.create();
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.18,
        damping: 0.12,
        render: {
          visible: false,
        },
      },
    });
    const walls = [
      Bodies.rectangle(width / 2, -wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { visible: false },
      }),
      Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, {
        isStatic: true,
        render: { visible: false },
      }),
    ];

    Composite.add(world, walls);
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    const applyFloatingMotion = (timestamp) => {
      if (timestamp - lastForceTimeRef.current >= MOTION_FRAME_INTERVAL) {
        lastForceTimeRef.current = timestamp;

        bodiesRef.current.forEach((body) => {
          const isDragging = selectedBodyRef.current?.id === body.id;
          const isModalFocus = modalBodyRef.current?.id === body.id;

          if (isDragging || isModalFocus) {
            Body.setVelocity(body, { x: 0, y: 0 });
            Body.setAngularVelocity(body, 0);
            return;
          }

          Body.applyForce(body, body.position, {
            x: (Math.random() - 0.5) * MOTION_FORCE_SCALE,
            y: (Math.random() - 0.5) * MOTION_FORCE_SCALE,
          });

          const speed = Math.hypot(body.velocity.x, body.velocity.y);

          if (speed > MAX_SPEED) {
            const scale = MAX_SPEED / speed;
            Body.setVelocity(body, {
              x: body.velocity.x * scale,
              y: body.velocity.y * scale,
            });
          }
        });
      }

      animationFrameRef.current = window.requestAnimationFrame(applyFloatingMotion);
    };

    const handleCollisionStart = (event) => {
      if (event.pairs.length > 0) {
        playCollisionSound();
      }
    };
    const handleMouseDown = (event) => {
      const hitBodies = Matter.Query.point(bodiesRef.current, event.mouse.position);
      pointerDownBodyRef.current = hitBodies[0] ?? null;
      didDragRef.current = false;
    };
    const handleMouseUp = () => {
      const clickedBody = pointerDownBodyRef.current;

      if (!didDragRef.current && clickedBody?.plugin?.movie) {
        frozenVelocityRef.current = {
          x: clickedBody.velocity.x,
          y: clickedBody.velocity.y,
          angular: clickedBody.angularVelocity,
        };
        modalBodyRef.current = clickedBody;
        Body.setVelocity(clickedBody, { x: 0, y: 0 });
        Body.setAngularVelocity(clickedBody, 0);
        setActiveMovie(clickedBody.plugin.movie);
      }

      pointerDownBodyRef.current = null;
      didDragRef.current = false;
    };
    const handleStartDrag = (event) => {
      didDragRef.current = true;
      selectedBodyRef.current = event.body ?? null;

      if (event.body) {
        Body.setVelocity(event.body, { x: 0, y: 0 });
        Body.setAngularVelocity(event.body, 0);
      }
    };
    const handleEndDrag = () => {
      selectedBodyRef.current = null;
    };

    engineRef.current = engine;
    worldRef.current = world;
    renderRef.current = render;
    runnerRef.current = runner;
    mouseConstraintRef.current = mouseConstraint;

    Events.on(engine, "collisionStart", handleCollisionStart);
    Events.on(mouseConstraint, "mousedown", handleMouseDown);
    Events.on(mouseConstraint, "mouseup", handleMouseUp);
    Events.on(mouseConstraint, "startdrag", handleStartDrag);
    Events.on(mouseConstraint, "enddrag", handleEndDrag);
    Runner.run(runner, engine);
    Render.run(render);
    animationFrameRef.current = window.requestAnimationFrame(applyFloatingMotion);

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      Events.off(engine, "collisionStart", handleCollisionStart);
      Events.off(mouseConstraint, "mousedown", handleMouseDown);
      Events.off(mouseConstraint, "mouseup", handleMouseUp);
      Events.off(mouseConstraint, "startdrag", handleStartDrag);
      Events.off(mouseConstraint, "enddrag", handleEndDrag);
      Render.stop(render);
      Runner.stop(runner);
      Composite.remove(world, mouseConstraint);
      Composite.remove(world, bodiesRef.current);
      bodiesRef.current = [];
      World.clear(world, false);
      Engine.clear(engine);

      if (render.canvas && render.canvas.parentNode) {
        render.canvas.parentNode.removeChild(render.canvas);
      }

      render.textures = {};

      engineRef.current = null;
      worldRef.current = null;
      renderRef.current = null;
      runnerRef.current = null;
      mouseConstraintRef.current = null;
      selectedBodyRef.current = null;
      modalBodyRef.current = null;
      pointerDownBodyRef.current = null;
      animationFrameRef.current = null;
      lastForceTimeRef.current = 0;
    };
  }, []);

  useEffect(() => {
    const world = worldRef.current;

    if (!world) {
      return undefined;
    }

    const { Bodies, Body, Composite } = Matter;
    const { width, height } = boundsRef.current;
    const existingBodies = bodiesRef.current;

    if (existingBodies.length > 0) {
      Composite.remove(world, existingBodies);
    }

    if (!Array.isArray(movies) || movies.length === 0) {
      bodiesRef.current = [];
      return undefined;
    }

    const radius = Math.max(28, Math.min(60, Math.min(width, height) * 0.08));
    const spawnPadding = radius + 20;
    const nextMovies = movies.slice(0, MAX_POSTER_BODIES);
    const posterBodies = nextMovies.map((movie) => {
      const texture = movie?.poster_path
        ? `${TMDB_POSTER_BASE_URL}${movie.poster_path}`
        : "";
      const x =
        spawnPadding + Math.random() * Math.max(1, width - spawnPadding * 2);
      const y =
        spawnPadding + Math.random() * Math.max(1, height - spawnPadding * 2);

      const body = Bodies.circle(x, y, radius, {
        restitution: 0.92,
        friction: 0,
        frictionAir: 0,
        frictionStatic: 0,
        plugin: {
          movie,
        },
        render: texture
          ? {
              sprite: {
                texture,
                xScale: (radius * 2) / POSTER_WIDTH,
                yScale: (radius * 2) / POSTER_WIDTH,
              },
            }
          : {
              fillStyle: "#38bdf8",
            },
      });

      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      });

      return body;
    });

    Composite.add(world, posterBodies);
    bodiesRef.current = posterBodies;

    return undefined;
  }, [movies]);

  const handleCloseModal = () => {
    const modalBody = modalBodyRef.current;

    if (modalBody) {
      Matter.Body.setVelocity(modalBody, {
        x: frozenVelocityRef.current.x,
        y: frozenVelocityRef.current.y,
      });
      Matter.Body.setAngularVelocity(
        modalBody,
        frozenVelocityRef.current.angular,
      );
    }

    modalBodyRef.current = null;
    setActiveMovie(null);
  };

  const posterUrl = activeMovie?.poster_path
    ? `${TMDB_POSTER_BASE_URL}${activeMovie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Poster";
  const genreList = Array.isArray(activeMovie?.genres)
    ? activeMovie.genres.map((genre) =>
        typeof genre === "string" ? genre : genre?.name,
      ).filter(Boolean)
    : [];

  return (
    <>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-neutral-700 bg-neutral-900 shadow-2xl">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/50 px-3 py-1 text-sm font-semibold text-white transition hover:bg-black/70"
            >
              Close
            </button>

            <div className="grid gap-6 md:grid-cols-[220px_1fr]">
              <img
                src={posterUrl}
                alt={activeMovie.title}
                className="h-full w-full bg-neutral-800 object-cover"
              />

              <div className="flex flex-col gap-4 p-6 text-white">
                <div>
                  <h2 className="text-3xl font-bold">{activeMovie.title}</h2>
                  {activeMovie.release_date && (
                    <p className="mt-1 text-sm text-neutral-400">
                      {new Date(activeMovie.release_date).getFullYear()}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-200">
                  <span className="rounded-full bg-indigo-500/20 px-3 py-1 font-semibold text-indigo-200">
                    Rating:{" "}
                    {activeMovie.vote_average != null
                      ? activeMovie.vote_average.toFixed(1)
                      : "N/A"}
                  </span>
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {genreList.length > 0 ? (
                      genreList.map((genre) => (
                        <span
                          key={genre}
                          className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-200"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-neutral-500">
                        Genre info unavailable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ZeroGravityCanvas;
