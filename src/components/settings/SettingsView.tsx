"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  Cpu,
  BookOpen,
  Sliders,
  Trash2,
  RotateCcw,
  Check,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getUserPreferences,
  saveUserPreferences,
  clearAllProjects,
  resetToDemoProjects,
} from "@/lib/storage";
import { AcademicLevel, UserPreferences } from "@/types/research";

export function SettingsView() {
  const [prefs, setPrefs] = useState<UserPreferences>(getUserPreferences());
  const [customKey, setCustomKey] = useState(prefs.customNebiusApiKey || "");
  const [selectedModel, setSelectedModel] = useState(
    prefs.selectedModel || "nvidia/nemotron-3-super-120b-a12b"
  );
  const [defaultLevel, setDefaultLevel] = useState<AcademicLevel>(prefs.defaultLevel || "Master's");
  const [primaryField, setPrimaryField] = useState(prefs.primaryField || "Computer Science");
  const [citationStyle, setCitationStyle] = useState(prefs.citationStyle || "APA");

  const [serverStatus, setServerStatus] = useState<{
    nebiusConfigured: boolean;
    nebiusModel: string;
    maskedKey: string | null;
    openAlexStatus: string;
  } | null>(null);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setServerStatus(data))
      .catch((err) => console.error("Error fetching status:", err));
  }, []);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveUserPreferences({
      customNebiusApiKey: customKey.trim() || undefined,
      selectedModel,
      defaultLevel,
      primaryField,
      citationStyle,
    });
    setPrefs(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-nebius", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: customKey.trim() || undefined,
          model: selectedModel,
        }),
      });

      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? "Connection operational" : "Connection failed"),
      });
    } catch (err: unknown) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Network test error",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearWorkspace = () => {
    if (confirm("Clear all projects in this browser? You can restore sample projects at any time.")) {
      clearAllProjects();
      setWorkspaceMessage("Workspace projects cleared. View Dashboard for the empty state.");
      setTimeout(() => setWorkspaceMessage(null), 3000);
    }
  };

  const handleRestoreDemoProjects = () => {
    resetToDemoProjects();
    setWorkspaceMessage("Sample demonstration research projects restored.");
    setTimeout(() => setWorkspaceMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Settings Header */}
      <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs">
        <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[#0F172A]">
          Application Settings & API Configuration
        </h2>
        <p className="mt-1 text-xs text-[#64748B]">
          Manage your inference engine credentials, NVIDIA Nemotron model selection, OpenAlex endpoints, and research defaults.
        </p>
      </div>

      {/* API Configuration Card */}
      <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#0F172A]" />
            <h3 className="text-sm font-semibold text-[#0F172A]">
              1. Nebius Token Factory (NVIDIA Nemotron)
            </h3>
          </div>
          {serverStatus?.nebiusConfigured ? (
            <Badge variant="verified" className="text-[10px] font-mono">
              SERVER ENVIRONMENT CONFIGURED
            </Badge>
          ) : customKey.trim() ? (
            <Badge variant="accent" className="text-[10px] font-mono">
              CLIENT KEY CONFIGURED
            </Badge>
          ) : (
            <Badge variant="warning" className="text-[10px] font-mono">
              KEY NOT CONFIGURED
            </Badge>
          )}
        </div>

        {/* Server vs Client Status Note */}
        <div className="p-3 rounded bg-[#FAFAF8] border border-[#E5E5E0] text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#18181B]">Server Environment Variable:</span>
            <span className="font-mono text-[11px] text-[#475569]">
              {serverStatus?.maskedKey || "NEBIUS_API_KEY is not set in process.env"}
            </span>
          </div>
          <p className="text-[11px] text-[#64748B]">
            Secret keys are never exposed to client browsers. You can set <code className="px-1 py-0.5 bg-[#EAEAE6] rounded font-mono">NEBIUS_API_KEY</code> in <code className="px-1 py-0.5 bg-[#EAEAE6] rounded font-mono">.env.local</code> or supply a session key below.
          </p>
        </div>

        {/* Key Input */}
        <div>
          <label htmlFor="customKey" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Session Nebius API Key
          </label>
          <input
            id="customKey"
            type="password"
            value={customKey}
            onChange={(e) => setCustomKey(e.target.value)}
            placeholder="e.g., neb_..."
            className="w-full text-xs font-mono px-3 py-2 rounded bg-white border border-[#E5E5E0] text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-all"
          />
          <p className="mt-1 text-[11px] text-[#64748B]">
            Stored securely in your local browser storage and used to sign outgoing requests if the server variable is unset.
          </p>
        </div>

        {/* Model Selection */}
        <div>
          <label htmlFor="model" className="block text-xs font-semibold text-[#0F172A] mb-1.5">
            Target NVIDIA Nemotron Model Identifier
          </label>
          <select
            id="model"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full text-xs sm:text-sm px-3 py-2 rounded bg-white border border-[#E5E5E0] text-[#18181B] font-mono focus:outline-none focus:ring-2 focus:ring-[#0F172A]/20 focus:border-[#0F172A] transition-all"
          >
            <option value="nvidia/nemotron-3-super-120b-a12b">
              nvidia/nemotron-3-super-120b-a12b (Default: High Reasoning & Planning)
            </option>
            <option value="nvidia/Nemotron-3-Ultra-550b-a55b">
              nvidia/Nemotron-3-Ultra-550b-a55b (Frontier Hybrid MoE)
            </option>
            <option value="nvidia/Llama-3.1-Nemotron-70B-Instruct-HF">
              nvidia/Llama-3.1-Nemotron-70B-Instruct-HF (Aligned Instruct)
            </option>
          </select>
        </div>

        {/* Test Connection Button & Result */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5E5E0]">
          <div className="text-xs">
            {testResult && (
              <span
                className={`inline-flex items-center gap-1.5 ${
                  testResult.success ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={isTesting}
            onClick={handleTestConnection}
            icon={<Cpu className="w-3.5 h-3.5" />}
          >
            Test Nemotron Connection
          </Button>
        </div>
      </div>

      {/* OpenAlex Status Card */}
      <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0F172A]" />
            <h3 className="text-sm font-semibold text-[#0F172A]">
              2. OpenAlex Academic Index
            </h3>
          </div>
          <Badge variant="verified" className="text-[10px] font-mono">
            FREE OPEN ACCESS INDEX
          </Badge>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          OpenAlex is connected directly via HTTPS polite-pool headers. It provides verified publication metadata, real DOIs, citations, and journal venues across 250M+ scientific records without requiring a paid subscription or private key.
        </p>
      </div>

      {/* Research Workspace Preferences */}
      <form onSubmit={handleSavePreferences} className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5E5E0] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#0F172A]" />
            <h3 className="text-sm font-semibold text-[#0F172A]">
              3. Research & Citation Preferences
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Default Academic Level
            </label>
            <select
              value={defaultLevel}
              onChange={(e) => setDefaultLevel(e.target.value as AcademicLevel)}
              className="w-full text-xs px-3 py-2 rounded bg-white border border-[#E5E5E0] text-[#18181B]"
            >
              <option value="Undergraduate">Undergraduate</option>
              <option value="Master's">Master&apos;s</option>
              <option value="PhD">PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Primary Research Field
            </label>
            <input
              type="text"
              value={primaryField}
              onChange={(e) => setPrimaryField(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded bg-white border border-[#E5E5E0] text-[#18181B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
              Preferred Citation Style
            </label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value as typeof citationStyle)}
              className="w-full text-xs px-3 py-2 rounded bg-white border border-[#E5E5E0] text-[#18181B]"
            >
              <option value="APA">APA 7th Edition</option>
              <option value="IEEE">IEEE Reference Style</option>
              <option value="Chicago">Chicago Manual of Style</option>
              <option value="BibTeX">BibTeX Standard</option>
            </select>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#E5E5E0]">
          {savedSuccess ? (
            <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Preferences saved successfully
            </span>
          ) : (
            <span className="text-[11px] text-[#64748B]">Preferences are saved in your local browser storage.</span>
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Preferences
          </Button>
        </div>
      </form>

      {/* Workspace Data Management */}
      <div className="bg-white border border-[#E5E5E0] rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm font-semibold text-[#0F172A] border-b border-[#E5E5E0] pb-2">
          4. Workspace Storage Management
        </h3>

        <p className="text-xs text-[#64748B]">
          You can test the application empty states by clearing local projects, or restore pre-validated demonstration benchmarks at any time.
        </p>

        {workspaceMessage && (
          <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900">
            {workspaceMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRestoreDemoProjects}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Restore Sample Projects
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleClearWorkspace}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Clear Workspace Projects (Test Empty State)
          </Button>
        </div>
      </div>
    </div>
  );
}
