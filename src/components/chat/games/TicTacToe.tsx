import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, FONTS, BORDER_RADIUS, SHADOWS } from '../../../utils/constants';
import { GameData } from '../../../types';

interface TicTacToeProps {
    matchId: string;
    gameData: GameData;
    isOwnTurn: boolean;
    onMove: (newState: string[]) => void;
}

export const TicTacToe: React.FC<TicTacToeProps> = ({
    gameData,
    isOwnTurn,
    onMove,
}) => {
    const board = gameData.state as string[] || Array(9).fill(null);

    const handlePress = (index: number) => {
        if (!isOwnTurn || board[index] || gameData.is_finished) return;

        const newBoard = [...board];
        newBoard[index] = isOwnTurn ? 'X' : 'O'; // Simplified logic, should ideally be based on user ID

        // In a real app, 'X' or 'O' would be assigned to players
        // For this prototype, let's assume 'X' is the initiator

        onMove(newBoard);
    };

    const renderCell = (index: number) => (
        <TouchableOpacity
            key={index}
            style={styles.cell}
            onPress={() => handlePress(index)}
            disabled={!isOwnTurn || !!board[index] || gameData.is_finished}
        >
            <Text style={[
                styles.cellText,
                board[index] === 'X' ? styles.xText : styles.oText
            ]}>
                {board[index]}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Tic-Tac-Toe</Text>
                <Text style={[styles.status, isOwnTurn ? styles.yourTurn : styles.theirTurn]}>
                    {gameData.is_finished
                        ? (gameData.winner_id === 'draw' ? "It's a Draw!" : (gameData.winner_id ? 'Game Over!' : 'Winner!'))
                        : (isOwnTurn ? "Your Turn" : "Waiting for opponent...")}
                </Text>
            </View>

            <View style={styles.board}>
                {board.map((_, i) => renderCell(i))}
            </View>

            {gameData.is_finished && (
                <View style={styles.footer}>
                    <Text style={styles.finishedText}>Game Finished</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    header: {
        marginBottom: SPACING.md,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: FONTS.bold,
        color: COLORS.text,
    },
    status: {
        fontSize: 14,
        fontFamily: FONTS.medium,
        marginTop: 4,
    },
    yourTurn: {
        color: COLORS.success,
    },
    theirTurn: {
        color: COLORS.textSecondary,
    },
    board: {
        width: 240,
        height: 240,
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: COLORS.border,
        padding: 2,
        borderRadius: BORDER_RADIUS.md,
    },
    cell: {
        width: 78,
        height: 78,
        backgroundColor: COLORS.white,
        margin: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cellText: {
        fontSize: 32,
        fontFamily: FONTS.bold,
    },
    xText: {
        color: COLORS.primary,
    },
    oText: {
        color: COLORS.accent,
    },
    footer: {
        marginTop: SPACING.md,
    },
    finishedText: {
        fontSize: 16,
        fontFamily: FONTS.bold,
        color: COLORS.textSecondary,
    },
});
