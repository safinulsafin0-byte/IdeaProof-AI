import { ResearchAnalysis } from "@/types/research";

export const DEMO_PROJECTS: ResearchAnalysis[] = [
  {
    id: "demo-contrastive-biomed",
    createdAt: "2026-10-15T14:30:00.000Z",
    title: "Contrastive Self-Supervised Representation Learning for Low-Resource Clinical Named Entity Recognition",
    topic: "Investigating whether contrastive token-level self-supervision on unannotated clinical discharge summaries can reduce label dependency in rare disease entity recognition compared to standard masked language modeling.",
    researchQuestion: "Can hard-negative contrastive token representations outperform MLM pre-training for clinical NER when annotated training tokens are restricted to fewer than 500 examples?",
    academicField: "Computer Science / Biomedical Informatics",
    academicLevel: "Master's",
    isDemo: true,
    modelUsed: "nvidia/nemotron-3-super-120b-a12b (Validated Benchmark)",

    executiveSummary:
      "This proposal investigates semi-supervised and self-supervised contrastive learning regimes to alleviate the acute data scarcity bottleneck in clinical named entity recognition (NER). By introducing syntax-aware token-level hard negatives derived from unannotated electronic health records, the method aims to improve boundary detection and semantic classification for ultra-rare clinical phenotypes.",
    problemStatement:
      "Supervised clinical NER systems achieve state-of-the-art accuracy only when trained on tens of thousands of human-annotated spans. However, for specialized clinical subfields, rare pathologies, and non-English clinical records, acquiring annotations is prohibitively expensive and constrained by strict privacy regulations (HIPAA, GDPR). Standard Masked Language Modeling (MLM) treats all masked tokens uniformly, failing to emphasize disambiguating subtle clinical boundaries.",

    researchQuestions: [
      "How do token-level contrastive loss formulations compare with cross-entropy token classification under 100, 250, and 500 annotated sample constraints?",
      "Does syntax-guided negative sampling prevent false negative collisions among clinically synonymous tokens?",
      "What is the computational overhead of contrastive token-pair mining during intermediate adaptation?",
    ],

    hypotheses: [
      {
        id: "h1",
        h0: "Token-level contrastive pre-training provides no statistically significant improvement in micro-averaged F1 score over standard BioBERT fine-tuning on fewer than 500 clinical annotations.",
        h1: "Token-level contrastive pre-training improves micro-averaged F1 score by at least 4.5 percentage points (p < 0.01) over BioBERT under low-resource regimes (<500 annotations).",
        rationale: "Contrastive objectives pull semantically aligned entity mentions closer in latent space while pushing dissimilar clinical contexts apart, yielding more discriminative decision boundaries.",
      },
      {
        id: "h2",
        h0: "Ontology-guided hard negative selection yields equivalent transfer performance to random in-batch negative token sampling.",
        h1: "Ontology-guided hard negative selection prevents semantic drift, outperforming random negative sampling by >= 2.8 F1 points on fine-grained diagnostic entities.",
        rationale: "Random negatives frequently sample true synonyms or co-occurring terms as negatives, which penalizes correct latent representations in medical vocabularies.",
      },
    ],

    potentialNoveltyAndGap: {
      gapDescription:
        "While contrastive sentence-level representations (e.g., SimCSE, MedCPT) are well-studied for clinical document retrieval, granular token-level contrastive learning explicitly bounded by clinical knowledge graphs remains underexplored for low-resource sequence tagging.",
      noveltyAssessment: "Moderate",
      differentiationFromPriorWork:
        "Differs from standard BioClinicalBERT by replacing token masking with dynamic token-pair contrastive objectives calibrated against UMLS Metathesaurus semantic types.",
      preliminaryNotice:
        "Preliminary AI Gap Hypothesis — This assessment is generated through conceptual analysis and must be confirmed against a formal systematic literature review before thesis defense or grant submission.",
    },

    suggestedMethodology: {
      framework: "Two-stage adaptation: (1) Intermediate contrastive token tuning on MIMIC-IV notes, followed by (2) Few-shot linear probing and fine-tuning on target clinical NER benchmarks.",
      phases: [
        {
          phaseNumber: 1,
          title: "Corpus Preparation & UMLS Graph Linking",
          durationWeeks: "Weeks 1–4",
          activities: [
            "De-identify and tokenize 100,000 unannotated clinical summaries from MIMIC-IV.",
            "Construct token co-occurrence matrices aligned with UMLS Concept Unique Identifiers (CUIs).",
            "Establish baseline fine-tuning scripts for BioLinkBERT and PubMedBERT.",
          ],
          deliverables: ["Curated pre-training corpus", "UMLS-guided negative sampling sampler module"],
        },
        {
          phaseNumber: 2,
          title: "Contrastive Architecture Implementation",
          durationWeeks: "Weeks 5–9",
          activities: [
            "Implement InfoNCE loss for token representations with temperature scaling (tau=0.07).",
            "Develop boundary-preserving projection heads.",
            "Run ablation on memory bank vs. in-batch contrastive queues on 2x NVIDIA A100 GPUs.",
          ],
          deliverables: ["Modular PyTorch training pipeline", "Ablation checkpoint suite"],
        },
        {
          phaseNumber: 3,
          title: "Empirical Evaluation & Error Analysis",
          durationWeeks: "Weeks 10–14",
          activities: [
            "Evaluate on NCBI Disease, BC5CDR, and rare disease subsets at 1%, 5%, and 10% data splits.",
            "Perform bootstrap significance testing (1,000 iterations).",
            "Conduct qualitative error categorization on false positive entity boundary splits.",
          ],
          deliverables: ["Final empirical results tables", "Significance test reports", "Draft manuscript"],
        },
      ],
      baselineMethods: [
        "BioBERT v1.1 with standard token classification head",
        "PubMedBERT (abstracts + full text) with cross-entropy loss",
        "Few-shot GPT-4 in-context learning with 5-shot demonstrations",
      ],
    },

    datasetRequirements: {
      requiredDataTypes: [
        "Unannotated clinical progress notes for intermediate pre-training",
        "Gold-standard clinical NER benchmark sets with span annotations (NCBI Disease, BC5CDR-chem, BC5CDR-disease)",
        "UMLS Metathesaurus version 2024AA for semantic type negative filtering",
      ],
      recommendedSources: [
        "PhysioNet MIMIC-IV Clinical Database (credentialed access required)",
        "NCBI Disease Corpus (publicly available via HuggingFace Datasets)",
        "BioCreative V CDR corpus",
      ],
      sampleSizeConsiderations:
        "Intermediate tuning requires at least 50k note excerpts; few-shot evaluation must be stratified across 5 random seed runs with 50, 100, 250, and 500 labelled sentences to calculate confidence intervals.",
    },

    evaluationMetrics: {
      quantitativeMetrics: [
        "Strict span-level Micro-F1, Precision, and Recall (CoNLL evaluation script standard)",
        "Relaxed overlap F1 score (partial boundary match)",
        "Out-of-vocabulary (OOV) entity recall rate",
      ],
      qualitativeCriteria: [
        "Clinical validity of predicted entity boundaries (reviewed with medical domain expert)",
        "Resistance to semantic drift in abbreviation expansions",
      ],
      benchmarkDatasets: ["NCBI Disease (793 PubMed abstracts)", "BC5CDR (1,500 articles)", "MIMIC-IV De-identified Notes"],
    },

    limitationsAndRisks: {
      feasibilityRisks: [
        "Credentialing for PhysioNet MIMIC-IV requires CITI training and institutional sign-off, which may introduce a 2-3 week delay.",
        "Contrastive token pairing increases GPU memory footprint by ~2.4x relative to standard MLM.",
      ],
      methodologicalRisks: [
        "Risk of false negatives if the ontology map misses non-standard clinical abbreviations or typos.",
        "Potential dataset bias towards intensive care patients rather than general outpatient cohorts.",
      ],
      ethicalConsiderations: [
        "Strict compliance with de-identification protocols; no patient-identifiable text snippets may be exported or logged in model weights.",
      ],
    },

    verifiedLiterature: [
      {
        id: "https://openalex.org/W3128746201",
        title: "PubMedBERT: Domain-Specific Language Model Pretraining for Biomedical Natural Language Processing",
        authors: ["Yu Gu", "Robert Tinn", "Hao Cheng", "Michael Lucas", "Naoto Usuyama", "Xiaodong Liu", "Jianfeng Gao", "Hoifung Poon"],
        publicationYear: 2021,
        doi: "https://doi.org/10.1145/3458754",
        source: "ACM Transactions on Computing for Healthcare",
        url: "https://doi.org/10.1145/3458754",
        citedByCount: 1420,
        isOpenAccess: true,
        abstractSnippet: "Pretrained language models have achieved state-of-the-art results across biomedical NLP tasks. Unlike previous models that initiate from general-domain BERT, PubMedBERT explores domain-specific pretraining from scratch on PubMed abstracts and full texts...",
      },
      {
        id: "https://openalex.org/W2963321528",
        title: "BioBERT: a pre-trained biomedical language representation model for biomedical text mining",
        authors: ["Jinhyuk Lee", "Wonjin Yoon", "Sungdong Kim", "Donghyeon Kim", "Sunkyu Kim", "Chan Ho So", "Jaewoo Kang"],
        publicationYear: 2020,
        doi: "https://doi.org/10.1093/bioinformatics/btz682",
        source: "Bioinformatics (Oxford Academic)",
        url: "https://doi.org/10.1093/bioinformatics/btz682",
        citedByCount: 4890,
        isOpenAccess: true,
        abstractSnippet: "Biomedical text mining has become increasingly important with the exponential growth of biological literature. We introduce BioBERT, a domain-specific language model pretrained on PubMed and PMC articles, yielding substantial gains on biomedical named entity recognition...",
      },
      {
        id: "https://openalex.org/W3165259461",
        title: "SimCSE: Simple Contrastive Learning of Sentence Embeddings",
        authors: ["Tianyu Gao", "Xingcheng Yao", "Danqi Chen"],
        publicationYear: 2021,
        doi: "https://doi.org/10.18653/v1/2021.emnlp-main.552",
        source: "Empirical Methods in Natural Language Processing (EMNLP)",
        url: "https://doi.org/10.18653/v1/2021.emnlp-main.552",
        citedByCount: 2150,
        isOpenAccess: true,
        abstractSnippet: "This paper presents SimCSE, a simple contrastive learning framework that advances state-of-the-art sentence embeddings. We show that simply predicting the same input sentence with standard dropout as noise acts as minimal data augmentation...",
      },
    ],
  },
  {
    id: "demo-climate-forecasting",
    createdAt: "2026-10-12T09:15:00.000Z",
    title: "Physics-Informed Graph Neural Networks for Micro-Climate Extreme Heat Anomaly Prediction",
    topic: "Developing hybrid graph neural networks incorporating Navier-Stokes thermodynamic constraints to predict hyper-local urban heat island anomalies with 72-hour forecast horizons.",
    researchQuestion: "Can thermodynamic conservation priors embedded in graph message-passing layers reduce spatial extrapolation error during unprecedented urban heat events?",
    academicField: "Climate Science / Machine Learning",
    academicLevel: "PhD",
    isDemo: true,
    modelUsed: "nvidia/nemotron-3-super-120b-a12b (Validated Benchmark)",

    executiveSummary:
      "This doctoral proposal explores physics-informed graph neural networks (PINNs) tailored for urban micro-climate forecasting. By encoding Navier-Stokes fluid and thermodynamic continuity equations directly into spatial edge features and loss penalty functions, the model aims to overcome the out-of-distribution failure modes of purely data-driven black-box neural weather models during extreme, unprecedented heatwave episodes.",
    problemStatement:
      "Conventional numerical weather prediction (NWP) models (e.g., WRF-Urban) are computationally prohibitive for real-time sub-kilometer urban grids. Conversely, modern deep learning weather predictors (GraphCast, ClimaX) rely entirely on historical data distributions and frequently violate basic mass and energy conservation laws during extreme climate anomalies, leading to unphysical temperature spikes and misleading municipal risk alerts.",

    researchQuestions: [
      "How can surface energy balance constraints be formulated as differentiable projection operators within non-Euclidean graph convolutional layers?",
      "To what extent does physics-regularized loss prevent hallucinated temperature divergences in regions lacking dense sensor coverage?",
      "What is the trade-off between inference speed and conservation adherence compared to high-resolution WRF runs?",
    ],

    hypotheses: [
      {
        id: "h1",
        h0: "Embedding thermodynamic conservation penalties produces no significant reduction in Root Mean Square Error (RMSE) on out-of-distribution heat extremes (> 99th percentile historical temps).",
        h1: "Embedding thermodynamic conservation penalties reduces spatial RMSE by at least 18% during extreme heat anomalies (> 99th percentile) compared to unconstrained Graph Neural Networks.",
        rationale: "Physics equations constrain the hypothesis space to physically plausible state transitions, preventing over-fitting to milder historical distributions.",
      },
    ],

    potentialNoveltyAndGap: {
      gapDescription:
        "While global-scale physics-informed models exist for synoptic atmospheric flow, localized boundary-layer micro-climates involving complex 3D urban canopy building geometries remain poorly modeled by differentiable graph operators.",
      noveltyAssessment: "Substantial",
      differentiationFromPriorWork:
        "Integrates high-resolution LiDAR-derived 3D urban canopy morphology into adaptive graph edge weights while enforcing local enthalpy conservation.",
      preliminaryNotice:
        "Preliminary AI Gap Hypothesis — This assessment is generated through conceptual analysis and must be confirmed against a formal systematic literature review before thesis defense or grant submission.",
    },

    suggestedMethodology: {
      framework: "Spatial-temporal message passing on mesh graphs with differentiable loss regularization enforcing mass and enthalpy continuity.",
      phases: [
        {
          phaseNumber: 1,
          title: "Sensor Network Integration & Graph Formulation",
          durationWeeks: "Weeks 1–6",
          activities: [
            "Aggregate multi-sensor urban telemetry (IoT weather stations, MODIS land surface temperature, Copernicus ERA5).",
            "Generate triangular Voronoi spatial graph meshes weighted by building aspect ratio and impervious surface fraction.",
          ],
          deliverables: ["Harmonized spatial dataset", "Differentiable graph mesh generation code"],
        },
        {
          phaseNumber: 2,
          title: "Physics-Informed Architecture Design",
          durationWeeks: "Weeks 7–16",
          activities: [
            "Formulate soft and hard thermodynamic boundary penalty terms in PyTorch Geometric.",
            "Benchmark spatio-temporal attention architectures against spatial GNN baselines.",
          ],
          deliverables: ["Working PINN model architecture", "Energy conservation monitoring dashboard"],
        },
        {
          phaseNumber: 3,
          title: "Extreme Event Validation & Ablation",
          durationWeeks: "Weeks 17–24",
          activities: [
            "Evaluate model on 2023 and 2024 European and North American record heatwaves.",
            "Compare forecast latency and accuracy against 1km WRF numerical simulations.",
          ],
          deliverables: ["Peer-reviewed journal paper submission", "Open-source benchmark suite"],
        },
      ],
      baselineMethods: [
        "Standard Spatio-Temporal Graph Neural Network (STGCN)",
        "High-Resolution Weather Research and Forecasting Model (WRF-Urban 1km)",
        "Vanilla Long Short-Term Memory (LSTM) baseline per sensor",
      ],
    },

    datasetRequirements: {
      requiredDataTypes: [
        "In-situ meteorological observations (temperature, relative humidity, wind velocity at 15-minute intervals)",
        "High-resolution Urban Canopy Parameters (sky view factor, albedo, building height)",
        "ERA5-Land reanalysis boundary conditions",
      ],
      recommendedSources: [
        "Copernicus Climate Data Store (ERA5-Land hourly)",
        "Open-Data municipal sensor networks (e.g., Array of Things, Urban Observatory)",
        "USGS 3D Elevation Program (3DEP) LiDAR",
      ],
      sampleSizeConsiderations:
        "10 continuous years of hourly observation data spanning at least 3 diverse metropolitan climates (e.g., Phoenix, Chicago, London) to test climatic transferability.",
    },

    evaluationMetrics: {
      quantitativeMetrics: [
        "Spatial Root Mean Square Error (RMSE) at 24h, 48h, and 72h lead times",
        "Continuous Ranked Probability Score (CRPS) for probabilistic uncertainty quantification",
        "Physical Conservation Violation Metric: Mean Absolute Energy Imbalance (W/m2)",
      ],
      qualitativeCriteria: [
        "Meteorological plausibility of urban heat plume advection contours",
        "Interpretability of spatial attention weights over urban park cool islands",
      ],
      benchmarkDatasets: ["Urban Observatory Weather Sensor Stream", "ERA5-Land High-Resolution Reanalysis"],
    },

    limitationsAndRisks: {
      feasibilityRisks: [
        "Sparse sensor density in socio-economically vulnerable neighborhoods may skew spatial graph edge weights.",
        "Solving non-linear thermodynamic equations at training time can increase step duration by up to 3x.",
      ],
      methodologicalRisks: [
        "Oversimplification of convective turbulent mixing inside deep urban street canyons.",
        "Missing anthropogenic heat emissions data during unannounced industrial shutdowns.",
      ],
      ethicalConsiderations: [
        "Urban heat warning models must be calibrated to avoid systematic under-prediction in high-density, low-income residential blocks.",
      ],
    },

    verifiedLiterature: [
      {
        id: "https://openalex.org/W4389146190",
        title: "GraphCast: Learning skillful medium-range global weather forecasting",
        authors: ["Remi Lam", "Alvaro Sanchez-Gonzalez", "Matthew Willson", "Peter Wirnsberger", "Meire Fortunato", "Ferran Alet", "Suman Ravuri", "Alexander Pritzel"],
        publicationYear: 2023,
        doi: "https://doi.org/10.1126/science.adi2336",
        source: "Science (American Association for the Advancement of Science)",
        url: "https://doi.org/10.1126/science.adi2336",
        citedByCount: 840,
        isOpenAccess: true,
        abstractSnippet: "Weather forecasting is one of the most computationally demanding scientific challenges. Here we present GraphCast, a machine learning–based weather forecasting system that makes 10-day predictions of hundreds of weather variables worldwide at 0.25° resolution in under a minute...",
      },
      {
        id: "https://openalex.org/W3005844893",
        title: "Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations",
        authors: ["M. Raissi", "P. Perdikaris", "G. E. Karniadakis"],
        publicationYear: 2019,
        doi: "https://doi.org/10.1016/j.jcp.2018.10.045",
        source: "Journal of Computational Physics",
        url: "https://doi.org/10.1016/j.jcp.2018.10.045",
        citedByCount: 8900,
        isOpenAccess: false,
        abstractSnippet: "We introduce physics-informed neural networks—neural networks that are trained to solve supervised learning tasks while respecting any given law of physics described by general nonlinear partial differential equations...",
      },
    ],
  },
];

