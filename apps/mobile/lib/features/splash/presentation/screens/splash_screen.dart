import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/navigation/presentation/screens/main_shell_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  double _bootProgress = 0.15;
  String _statusText = 'Inisialisasi Sistem Akuaponik...';

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    );

    _scaleAnimation = Tween<double>(begin: 0.92, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );

    _controller.forward();
    _startBootSequence();
  }

  Future<void> _startBootSequence() async {
    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() {
      _bootProgress = 0.45;
      _statusText = 'Sinkronisasi Sensor & Kaskade 4-Level...';
    });

    await Future.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    setState(() {
      _bootProgress = 0.85;
      _statusText = 'Memuat Model Prediktif GDD & AI...';
    });

    await Future.delayed(const Duration(milliseconds: 500));
    if (!mounted) return;
    setState(() {
      _bootProgress = 1.0;
      _statusText = 'Ekosistem Siap ✨';
    });

    await Future.delayed(const Duration(milliseconds: 400));
    if (!mounted) return;

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, animation, _) => FadeTransition(
          opacity: animation,
          child: const MainShellScreen(),
        ),
        transitionDuration: const Duration(milliseconds: 450),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Spacer(flex: 3),

                // Animated Official Emblem & Brand Logo
                ScaleTransition(
                  scale: _scaleAnimation,
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Official Botanical Emblem with Soft Pine Ambient Shadow
                        Container(
                          width: 104,
                          height: 104,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(28),
                            border: Border.all(color: AppTheme.borderLight),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.pinePrimary.withValues(alpha: 0.15),
                                blurRadius: 24,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: Image.asset(
                              'assets/images/app_icon_official.png',
                              fit: BoxFit.contain,
                              errorBuilder: (_, _, _) => const Icon(
                                Icons.eco_rounded,
                                size: 52,
                                color: AppTheme.pinePrimary,
                              ),
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Official Horizontal UrbanGrow Wordmark
                        Image.asset(
                          'assets/images/urbangrow-logo.png',
                          height: 38,
                          fit: BoxFit.contain,
                          errorBuilder: (_, _, _) => const Text(
                            'UrbanGrow',
                            style: TextStyle(
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              letterSpacing: -0.6,
                              color: AppTheme.textPrimary,
                            ),
                          ),
                        ),

                        const SizedBox(height: 10),

                        // Subtitle Pill
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.mintWash,
                            borderRadius: BorderRadius.circular(999),
                            border: Border.all(
                              color: AppTheme.sageMint.withValues(alpha: 0.25),
                            ),
                          ),
                          child: const Text(
                            'SMART AQUAPONIC IoT & PREDICTIVE AI',
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                              fontFamily: 'monospace',
                              color: AppTheme.mintText,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const Spacer(flex: 2),

                // Smooth Progress Bar & Status Text
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Column(
                    children: [
                      // Smooth Progress Track
                      Container(
                        width: 180,
                        height: 5,
                        decoration: BoxDecoration(
                          color: AppTheme.canvas,
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(999),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 350),
                            curve: Curves.easeInOut,
                            alignment: Alignment.centerLeft,
                            child: FractionallySizedBox(
                              widthFactor: _bootProgress,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: AppTheme.pinePrimary,
                                  borderRadius: BorderRadius.circular(999),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        child: Text(
                          _statusText,
                          key: ValueKey<String>(_statusText),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: AppTheme.textSecondary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ],
                  ),
                ),

                const Spacer(flex: 2),

                // Signature Institutional Footer
                FadeTransition(
                  opacity: _fadeAnimation,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child: Column(
                      children: const [
                        Text(
                          'REGU MAWAR // SMK TELKOM SIDOARJO',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                            letterSpacing: 1.1,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'v1.0.6 • Climate Adaptive Agro-Tech',
                          style: TextStyle(
                            fontSize: 10,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
