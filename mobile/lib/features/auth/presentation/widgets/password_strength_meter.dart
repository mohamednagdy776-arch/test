import 'package:flutter/material.dart';
import '../../../../core/constants/theme.dart';

// Mirrors web's reset-password page ((auth)/reset-password/[token]/page.tsx):
// a 5-point score (length>=8, length>=12, mixed case, digit, symbol) bucketed
// into a 4-level strength label. Kept as a free function so screens can also
// use it in a submit-button validity check if needed, not just for display.
class PasswordStrengthLevel {
  final int level; // 1-4
  final String label;
  final Color color;
  const PasswordStrengthLevel(this.level, this.label, this.color);
}

PasswordStrengthLevel? passwordStrengthOf(String password) {
  if (password.isEmpty) return null;
  var score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (RegExp(r'[a-z]').hasMatch(password) && RegExp(r'[A-Z]').hasMatch(password)) score++;
  if (RegExp(r'\d').hasMatch(password)) score++;
  if (RegExp(r'[^a-zA-Z0-9]').hasMatch(password)) score++;

  if (score <= 1) return const PasswordStrengthLevel(1, 'ضعيفة', AppTheme.dangerColor);
  if (score <= 2) return const PasswordStrengthLevel(2, 'متوسطة', AppTheme.warningColor);
  if (score <= 3) return const PasswordStrengthLevel(3, 'قوية', AppTheme.successColor);
  return const PasswordStrengthLevel(4, 'قوية جداً', AppTheme.successColor);
}

class PasswordStrengthMeter extends StatelessWidget {
  final String password;
  const PasswordStrengthMeter({super.key, required this.password});

  @override
  Widget build(BuildContext context) {
    final strength = passwordStrengthOf(password);
    if (strength == null) return const SizedBox.shrink();
    final track = AppTheme.textSecondary.withValues(alpha: 0.2);
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: List.generate(4, (i) {
              final filled = i < strength.level;
              return Expanded(
                child: Container(
                  height: 4,
                  margin: EdgeInsets.only(left: i == 3 ? 0 : 4),
                  decoration: BoxDecoration(
                    color: filled ? strength.color : track,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              );
            }),
          ),
          const SizedBox(height: 4),
          Text(strength.label, style: TextStyle(fontSize: 11, color: strength.color)),
        ],
      ),
    );
  }
}
