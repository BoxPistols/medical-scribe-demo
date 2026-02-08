import React from "react";
import {
  ClockIcon,
  FaceFrownIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const problems = [
  {
    Icon: ClockIcon,
    color: "#f59e0b",
    title: "カルテ作成に膨大な時間",
    desc: "1日の診療時間の約40%がドキュメント作成に費やされています",
  },
  {
    Icon: FaceFrownIcon,
    color: "#f97316",
    title: "医師の燃え尽き症候群",
    desc: "事務作業の増加が医師の疲労とストレスの主要因に",
  },
  {
    Icon: PencilSquareIcon,
    color: "#38bdf8",
    title: "記録の正確性と一貫性",
    desc: "手動入力によるミスや記載漏れのリスク",
  },
];

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const headerOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const headerY = interpolate(frame, [0, 20], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #0f172a, #1a1a2e)",
        padding: 80,
        opacity: fadeOut,
      }}
    >
      {/* Section Header */}
      <div
        style={{
          opacity: headerOpacity,
          transform: `translateY(${headerY}px)`,
          marginBottom: 60,
        }}
      >
        <p
          style={{
            fontSize: 18,
            color: "#f59e0b",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 600,
            margin: 0,
          }}
        >
          The Problem
        </p>
        <h2
          style={{
            fontSize: 52,
            color: "white",
            fontWeight: 700,
            margin: "12px 0 0",
          }}
        >
          医療現場が抱える課題
        </h2>
      </div>

      {/* Problem Cards */}
      <div
        style={{
          display: "flex",
          gap: 32,
          flex: 1,
          alignItems: "center",
        }}
      >
        {problems.map((problem, i) => {
          const delay = 25 + i * 15;
          const cardScale = spring({
            frame: frame - delay,
            fps,
            config: { damping: 12, stiffness: 80 },
          });
          const cardOpacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                borderRadius: 20,
                padding: 40,
                opacity: cardOpacity,
                transform: `scale(${cardScale})`,
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ width: 48, height: 48, marginBottom: 20 }}>
                <problem.Icon
                  style={{
                    width: "100%",
                    height: "100%",
                    color: problem.color,
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: 24,
                  color: "white",
                  fontWeight: 600,
                  margin: "0 0 12px",
                }}
              >
                {problem.title}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  color: "#94a3b8",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {problem.desc}
              </p>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
